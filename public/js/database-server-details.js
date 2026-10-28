const server = JSON.parse(localStorage.getItem("selectedServer"));

if(server){

document.getElementById("serverName").innerText=server.name;

document.getElementById("status").innerText=server.status;

document.getElementById("pool").innerText=server.pool;

document.getElementById("ocpu").innerText=server.ocpu;

document.getElementById("memory").innerText=server.memory+" GB";

document.getElementById("region").innerText=server.region;

}