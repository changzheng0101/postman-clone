const axios = require('axios');

axios({
    url:'https://www.icofont.cn//sd',
    method:'GET',
})
.then(response=>{
    console.log(response.status);
})
.catch(error=>{
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
})