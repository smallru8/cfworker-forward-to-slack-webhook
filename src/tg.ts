import { Hono } from 'hono'
import { Bindings } from './utils'
import * as slack_api from './api/slack'
import { get_file } from './api/telegram'

const hono_tg_webhook = new Hono<{ Bindings: Bindings }>()

hono_tg_webhook.post(`/webhook`, async (c) => {

    const key = c.req.query('key')
    if(key!==c.env.WEBHOOK_KEY){
        return c.text('200 KEY ERROR',200)
    }
    const data = await c.req.json()
    var from_name = ""
    var from_group = ""
    var text = ""

    //Channel message
    if(data.channel_post && data.channel_post.text && data.channel_post.sender_chat.title){
        from_group = data.channel_post.sender_chat.title
        if(data.channel_post.text)
            text = data.channel_post.text
        else if(data.channel_post.caption)
            text = data.channel_post.caption
    }
    //Private message
    else if(data.message && !data.message.from.is_bot && data.message.chat.type=="private"){
        from_name = `${data.message.from.last_name} ${data.message.from.first_name}`
        from_group = "Private"
        if(data.message.text)
            text = data.message.text
        else if(data.message.caption)
            text = data.message.caption
    }
    //Group message
    else if(data.message && !data.message.from.is_bot && (data.message.chat.type=="group" || data.message.chat.type=="supergroup")){
        from_name = `${data.message.from.last_name} ${data.message.from.first_name}`
        from_group = data.message.chat.title
        if(data.message.text)
            text = data.message.text
        else if(data.message.caption)
            text = data.message.caption
    }
    else {
        return c.text('200 IGNORE',200)
    }

    //var msg = `*Group:*\n${from_group}  \n*Message:*\n${text}`
    var msg = `*Message:*\n${text}` //不傳 group
    if(from_name !== ""){
        msg=`*From:*\n${from_name}  \n`+msg
    }

    console.log(data)//debug

    if(text !== "" || data.message.document || data.message.photo){
        
        var file
        if(data.message.document){
            file = await get_file(c.env.TG_TOKEN,data.message.document.file_id)
        }else if(data.message.photo){
            file = await get_file(c.env.TG_TOKEN,data.message.photo[data.message.photo.length-1].file_id)
        }
        
        if(file?.body){ //發訊息、檔案
            console.log("send file and message")//debug
            await slack_api.send_file_msg(c.env.SLACK_TOKEN,msg,await file.blob(),c.env.SLACK_CHANNEL).catch(
                function(error) {
                    console.log(error);
                }
            )
        } else { //發訊息
            console.log("send message")//debug
            await slack_api.send_msg(c.env.SLACK_TOKEN,msg,c.env.SLACK_CHANNEL).catch(
                function(error) {
                    console.log(error);
                }
            )
        }
    }
    
    return c.text('200 ACCEPT',200)
})

export default hono_tg_webhook