const server = JSON.parse(localStorage.getItem("selectedServer"));

if(server){

document.getElementById("poolName").innerText = server.pool;

document.getElementById("status").innerText = server.status;

document.getElementById("region").innerText = server.region;

}

const servers = JSON.parse(localStorage.getItem("dbServers")) || [];

const tbody = document.getElementById("serverTable");

let usedCpu = 0;

servers.forEach(s=>{

if(server && s.pool===server.pool){

usedCpu += Number(s.ocpu);

tbody.innerHTML += `

<tr>

<td>${s.name}</td>

<td>${s.ocpu}</td>

<td>${s.memory} GB</td>

<td>${s.status}</td>

</tr>

`;

}

});

document.getElementById("usedCpu").innerText = usedCpu;

document.getElementById("freeCpu").innerText = 64-usedCpu;