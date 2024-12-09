/**
 * 從 tg 上下載檔案
 * @param tg_token 
 * @param file_id 
 * @returns 
 */
export async function get_file(tg_token: string, file_id: string){
    const file_path:any = await fetch(`https://api.telegram.org/bot${tg_token}/getFile?file_id=${file_id}`, {}).then(res => res.json())
    if(file_path["ok"]){
        const file = await fetch(`https://api.telegram.org/file/bot${tg_token}/${file_path["result"]["file_path"]}`, {})
        return file
    }else{
        return null
    }
}