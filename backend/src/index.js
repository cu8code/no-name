import express from "express";
import Replicate from "replicate";
import { readFormChatDB, readSpecificSenderStat, writeToChatDB } from "./storage.js";

const app = express()
const REPLICATE_API_TOKEN = "r8_XarCoZsjFN8ybPyFFi0QUJwImPYj7ml3sRyRV"
const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});

app.use(express.json())

const cook = async (sender_name, receiver_name, about_sender, sender_food, sender_happy, history, prompt) => {
    let f = ``
    console.log(history);
    history.forEach(e => {
        f = `${f}\n${e.sender}: ${e.content}\n`
    })

    console.log(f);

    const s = `
Do not generate code only give plain text. Do not give extra text strictly follow the pattern provided. This is game, there is 3 things the player can control. food (0-1) happy (0-1) go-to (none | park | jail | school| collage | while house | bar) love (0-1) the higher the number the better.
The name of the player: "${sender_name}"
About: ${about_sender}
food: ${sender_food}
happy: ${sender_happy}

Here is history of ${sender_name} conversion with ${receiver_name}.
${f}
${prompt}

Write what will be reply of Ankan the format of
\`\`\`json
{
reply: "some string",
question: "some string" | null
food: number,
happy: number,
go-to: "string",
}
\`\`\`
`

console.log(s);

    const input = {
        debug: false,
        top_k: 50,
        top_p: 0.9,
        prompt: s,
        temperature: 0.8,
        max_new_tokens: 512,
        min_new_tokens: -1,
        prompt_template: "<s>[INST] {prompt} [/INST] ",
        repetition_penalty: 1.15,
    };

    return await replicate.run("mistralai/mistral-7b-instruct-v0.2", { input })

}


app.post("/", async (req, res) => {
    const sender = req.body.sender
    const receiver = req.body.receiver
    const prompt = req.body.prompt
    const about = req.body.about


    const stat = readSpecificSenderStat(sender)
    const history = readFormChatDB(sender, receiver)

    console.log(stat, history);

    const f = await cook(sender, receiver, about, stat?.food || Math.random(), stat?.happy || Math.random(), history, prompt)
    const output = await f.join("")
    const lines = output.split("\n")
    lines.shift(); // Remove the first line
    lines.pop();   // Remove the last line
    const modifiedString = lines.join('\n');
    try{
        const js = JSON.parse(modifiedString)
        if(js.reply!=null){
            writeToChatDB(sender,receiver,`reply:${js.reply}`)
        }
        if(js.question!=null){
            writeToChatDB(sender,receiver,`question:${js.question}`)
        }
    }catch(e) {
        console.log(output);
    }

    res.send(await f.join(""))
})

app.get("/", (req, res) => {
    res.send(JSON.stringify({
        "type": "scucess"
    }))
})

app.listen(8080, async () => {
    console.log(`http://localhost:${8080}`);
})
