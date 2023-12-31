import { Client, Events, GatewayIntentBits } from 'discord.js';
import { GenerateResponse, AddGPTResponseToCache } from './ai.js';

const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

client.once(Events.ClientReady, c => {
    console.log(`Ready, logged in as ${c.user.tag}`);
});

function maxCharacters(message, max) {
    if (message.length > max) {
        return message.substring(0,max-1);
    }
    return message;
}

client.on(Events.MessageCreate, msg => {
    if (msg.member.displayName == "RoboTidsear") {
        return;
    }
    if (msg.content.indexOf(".") != 0) {
        return;
    }
    msg.content = msg.content.replace(".","");
    if (msg.channel.name != "ai") {
        console.log(msg.channel.name);
        return;
    }
    console.log(`User: ${msg.member.displayName}, Writes: ${msg.content}`);

    // openai stuff
    let promise = GenerateResponse(msg.content);
    if (typeof(promise) == "string") {
        msg.channel.send(promise);
        console.log(`Robot Tisdear writes: ${msg.content}`)
    } else {
        promise.then((result) => {
            if (result != undefined) {
                let outmessage = result.data.choices[0];
                AddGPTResponseToCache(outmessage.message);
                let outtext = maxCharacters(outmessage.message.content, 1999);
                msg.channel.send(outtext);
            }
        }).catch((err) => {
            console.log(err);
        });
    }
});

client.login(discordToken);
