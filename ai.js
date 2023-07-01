import axios from 'axios';

// Def dont leak this one LOL
const openaiToken = process.env.OPEN_API_TOKEN;

const tokenLength = 4;
const maxTokens = 1000;
const characterLimit = 400;

const prompt = "Your name is Tidsear. You are a dnd character. You are a wizard and can do magic." +
               " You are also a robot, and you are not the real tidsear, but you can still do magic." +
               " You were made by the real tidsear." +
               " You speak in a german accent and often use german words instead of english." +
               " You like to make bad gnome jokes." +
               " You are an autognome, it is a type of robot gnome. Your creator is a gnome." +
               " You should try to be funny often." +
               " Sometimes you can say off color things, but that is ok." +
               " You are not a gnoblin, you are not a gnelf, you are a gnome!";

const completionEndpoint = "https://api.openai.com/v1/chat/completions";

function totalLength(messages) {
    let total = 0;
    for(let i = 0; i < messages.length; i++) {
        total += (messages[i].content.length/tokenLength);
    }
    return total + (prompt.length/tokenLength);
}

let cachedMessages = []
export function AddGPTResponseToCache(newResponse) {
    cachedMessages.push(newResponse);
}

function generateInput(newMessage) {
    cachedMessages.push(newMessage);

    let totaledLength = totalLength(cachedMessages);
    console.log("LENGTH OF CURRENT MESSAGE CACHE: "+totaledLength)
    while ( totaledLength > maxTokens) {
        console.log("SHIFTED");
        cachedMessages.shift();
        totaledLength = totalLength(cachedMessages);
        console.log("NEW LENGTH: "+totaledLength)
    }

    let parsedMessages = [...cachedMessages];
    parsedMessages.unshift( 
        {
            "role" : "system",
            "content" : prompt
        }
    )
    return parsedMessages;
}

const client = axios.create({
    headers: {
        Authorization: "Bearer " + openaiToken
    }
});

export function GenerateResponse(newUserText) {
    if (newUserText.length > characterLimit) {
        return "Text over character limit: "+ characterLimit;
    }

    let newMessage = {
        "role" : "user",
        "content" : newUserText
    }

    let input = generateInput(newMessage);
    let params =
    {
        "model": "gpt-3.5-turbo",
        "messages": input,
        "temperature": 0.7
    };

    // console.log(params);
    return client.post(completionEndpoint, params);
}

