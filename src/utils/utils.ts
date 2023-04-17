export const RAPIDAI_API_KEY = 'f77a4f6c61mshb9476989f8ff223p1339f8jsn2012b8b5df3b'
export const BASE_URL = "https://simple-chatgpt-api.p.rapidapi.com/ask"
export const RAPIDAI_HOST = "simple-chatgpt-api.p.rapidapi.com"

export function generateUniqueId(){
    const timeStamp:number = Date.now();
    const randomNumber:number = Math.random();
    const hexString:string = randomNumber.toString(10)

    return `id-${timeStamp}-${hexString}`;
}