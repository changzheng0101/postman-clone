import axios from "axios"
import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import prettyBytes from 'pretty-bytes'
import setupEditors from './setEditor'

const queryParamsContainer = document.querySelector('[data-query-params]')
const headerParamsContainer = document.querySelector('[data-query-headers]')
const responseHeadersContainer = document.querySelector('[data-response-headers]')
const keyValueTemplate = document.querySelector('[data-key-value-pair-template]')
const form = document.querySelector('[data-form]')
const {requestEditor,updateResponseEditor } = setupEditors()

document.querySelector('[data-query-params-button]').addEventListener('click',()=>{
    queryParamsContainer.append(createKeyValuePair())
})
document.querySelector('[data-query-headers-button]').addEventListener('click',()=>{
    headerParamsContainer.append(createKeyValuePair())
})

queryParamsContainer.append(createKeyValuePair())
headerParamsContainer.append(createKeyValuePair())

function createKeyValuePair(){
    const element = keyValueTemplate.content.cloneNode(true)
    element.querySelector('[data-remove-btn]').addEventListener('click',(el)=>{
        el.target.closest('[data-key-value-pair]').remove()
    })
    return element
}

axios.interceptors.request.use(request=>{
    request.customData = request.customData || {}
    request.customData.startTime = new Date().getTime()
    return request
})

function updateEndTime(response) {
    response.customData = response.customData || {}
    response.customData.time =
      new Date().getTime() - response.config.customData.startTime
    return response
  }

axios.interceptors.response.use(updateEndTime, err => {
    return Promise.reject(updateEndTime(err.response))
})

form.addEventListener('submit',e=>{
    e.preventDefault()

    let data
    try {
        data = JSON.parse(requestEditor.state.doc.toString() || null)
    } catch (e) {
        alert("JSON data is malformed")
        return
    }

    axios({
        url:document.querySelector('[data-url]').value,
        method:document.querySelector('[data-method]').value,
        params:keyValueToObject(queryParamsContainer),
        headers:keyValueToObject(headerParamsContainer),
        data
    })
    .catch(e=>e)
    .then(response=>{
        document.querySelector('[data-response-section]').classList.remove('d-none')
        updateResponseDetails(response);
        updateResponseHeaders(response.headers);
        updateResponseEditor(response.data);
    })
   
    
})

function keyValueToObject(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]')
    return [...pairs].reduce((data,pair)=>{
        const key = pair.querySelector('[data-key]').value
        const value =  pair.querySelector('[data-value]').value
        if(key === '') return data;
        return {...data,[key]:value}
    },{})
}

function updateResponseDetails(response){
    document.querySelector('[data-status]').textContent = response.status
    document.querySelector("[data-time]").textContent = response.customData.time
    document.querySelector("[data-size]").textContent = prettyBytes(
        JSON.stringify(response.data).length +
        JSON.stringify(response.headers).length
    )
}

function updateResponseHeaders(headers){
    responseHeadersContainer.innerHTML = ""
    Object.entries(headers).forEach(([key,value])=>{
        const keyElement = document.createElement('div')
        keyElement.textContent = key
        responseHeadersContainer.append(keyElement)
        const valueElement = document.createElement('div')
        valueElement.textContent = value
        responseHeadersContainer.append(valueElement)
    })
}




