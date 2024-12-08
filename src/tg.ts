import { Hono } from 'hono'
import * as jose from 'jose'
import { Bindings } from './utils'

const hono_tg_webhook = new Hono<{ Bindings: Bindings }>()

hono_tg_webhook.post(`/webhook`, async (c) => {

    const key = c.req.query('key')
    if(key!==c.env.WEBHOOK_KEY){
        const body = await c.req.parseBody()
        console.log(body)
    }

})

export default hono_tg_webhook