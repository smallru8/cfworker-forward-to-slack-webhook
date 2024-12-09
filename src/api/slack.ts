
/**
 * 發訊息到 slack
 * @param slack_token 
 * @param msg 
 * @param channel 
 * @returns 
 */
export async function send_msg(slack_token: string, msg: string, channel: string="C04QXG897T8"){
    const headers = {
        'Authorization': `Bearer ${slack_token}`,
    }
    try {
        let formData2 = new FormData()
        formData2.append('channel', channel)

        let msg_att = JSON.stringify(
            [{
                color : "#3893ff",
                blocks : [
                    {
                        type : "section",
                        text : {
                            type : "mrkdwn",
                            text : msg
                        }
                    }
                ]
            }]
        )

        //formData2.append('attachments', msg_att)
        formData2.append('text', msg)
        const postMessage_res = await fetch("https://slack.com/api/chat.postMessage", {
            method: 'POST',
            body: formData2,
            headers: headers
        })
        const data2:any = await postMessage_res.json()
        return data2
    } catch (error) {
        console.error('Error sending message:', error)
    }
    return null
}

/**
 * 發訊息、檔案到 slack
 * @param slack_token 
 * @param msg 
 * @param file_body 
 * @param channel 
 * @param file_name 
 */
export async function send_file_msg(slack_token: string, msg: string, file_body: any, channel: string="C04QXG897T8", file_name: string="img"){
    const headers = {
        'Authorization': `Bearer ${slack_token}`,
    }

    try {
        //files.getUploadURLExternal
        const getUploadURLExternal_res = await fetch(`https://slack.com/api/files.getUploadURLExternal?filename=${file_name}&length=${file_body.size}`, {
            method: 'GET',
            headers: headers
        })
        const data0:any = await getUploadURLExternal_res.json()
        console.log(data0)//debug
        
        //Upload
        const upload_file_res = await fetch(data0.upload_url, {
            method: 'POST',
            body: file_body,
            headers: headers
        })
        const data1:any = await upload_file_res.text()
        console.log(data1)//debug

        //files.completeUploadExternal
        let formData2 = new FormData()
        formData2.append('channel_id', channel)
        formData2.append('files', `[{"id":"${data0.file_id}"}]`)
        formData2.append('initial_comment', msg)
        const completeUploadExternal_res = await fetch("https://slack.com/api/files.completeUploadExternal", {
            method: 'POST',
            body: formData2,
            headers: headers
        })
        const data2:any = await completeUploadExternal_res.json()
        console.log(data2)//debug

    } catch (error) {
        console.error('Error uploading file:', error)
    }
}