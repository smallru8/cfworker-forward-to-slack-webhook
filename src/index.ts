import { Hono } from 'hono'
import hono_tg_webhook from "./tg"
import hono_well_known from './well_known'
interface Env {}

const app = new Hono()

app.get('/', (c) => {
  return c.text('404 page not found',404)
})

app.route("/tg",hono_tg_webhook)
app.route("/.well-known",hono_well_known)

export default {
    /** cloudflare trigger job*/
    scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        const delayedProcessing = async () => {
            //clear timeout data
            //await clear_db_oidc_req_tmp(env);
        };
        ctx.waitUntil(delayedProcessing());
    },
    /** hono */
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },
};