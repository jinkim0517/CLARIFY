document.addEventListener("DOMContentLoaded", async () => {

    const sleep = ms => new Promise(r => setTimeout(r, ms))

    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }

    const showPopup = async (answer) => {
        if (answer !== "CLOUDFLARE" && answer !== "ERROR") {
            try {
                let res = await answer.split("data:")
                try {
                    const detail = JSON.parse(res[0]).detail
                    document.getElementById('output').style.opacity = 1
                    document.getElementById('output').innerHTML = detail
                    return;
                } catch (e) {
                    try {
                        res = res[1].trim()
                        if (res === "[DONE]") return
                        answer = JSON.parse(res)
                        let final = answer.message.content.parts[0]
                        final = final.replace(/\n/g,'<br>')
                        document.getElementById('output').style.opacity = 1
                        document.getElementById('output').innerHTML = final
                    } catch (e) {}
                }
            } catch (e) {
                document.getElementById('output').style.opacity = 1
                document.getElementById('output').innerHTML = "Something went wrong. Please try again later."
            }

        } else if (answer === "CLOUDFLARE") {
            document.getElementById('input').style.opacity = 1
            document.getElementById('input').innerHTML = 'You need to once visit <a target="_blank" href="https://chat.openai.com/chat">chat.openai.com</a> and check if the connection is secure. Redirecting...'
            await sleep(3000)
            chrome.tabs.create({url: "https://chat.openai.com/chat"})
        } else {
            document.getElementById('output').style.opacity = 1
            document.getElementById('output').innerHTML = 'Something went wrong. Are you logged in to <a target="_blank" href="https://chat.openai.com/chat">chat.openai.com</a>? Try logging out and logging in again.'
        }
    }

    const getData = async (selection) => {
        if (!selection.length == 0) {
            document.getElementById('output').style.opacity = 0.5
            document.getElementById('input').innerHTML = selection
            document.getElementById('input').style.opacity = 1
            document.getElementById('output').innerHTML = "Clarifying Word..."
            const port = chrome.runtime.connect();
            port.postMessage({question: 'Explain the phrase ' + selection + ' as if I were not a native English speaker and provide an example. Make sure your response does not exceed 40 words, unless you cannot finish the sentence otherwise. make sure the definition and example are separated into two sections. Use english that a child could understand. only respond with plain text and not markdown. never bold or italicize any text.'});
            port.onMessage.addListener((msg) => showPopup(msg))
        } else {
            document.getElementById('input').style.opacity = 0.5
            document.getElementById('input').innerHTML = "Please select the text to clarify."
        }
    }

    const getSelectedText = async () => {
        const activeTab = await getActiveTab()
        chrome.tabs.sendMessage(activeTab.id, {type: "LOAD"}, getData)
    }

    getSelectedText()
})