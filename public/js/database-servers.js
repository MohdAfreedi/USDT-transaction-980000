// ======================================
// AFREEDI CLOUD - DATABASE SERVERS
// ======================================

// Load servers from localStorage
let servers = JSON.parse(localStorage.getItem("dbServers")) || [];

// DOM Elements
const table = document.getElementById("serverTable");
const searchInput = document.getElementById("searchServer");
const regionFilter = document.getElementById("regionFilter");
const statusFilter = document.getElementById("statusFilter");
const poolFilter = document.getElementById("poolFilter");

// =========================
// Render Table
// =========================

function renderTable() {

    table.innerHTML = "";

    let filtered = servers.filter(server => {

        const searchMatch =
            server.name.toLowerCase().includes(searchInput.value.toLowerCase());

        const regionMatch =
            regionFilter.value === "All Regions" ||
            server.region === regionFilter.value;

        const statusMatch =
            statusFilter.value === "All Status" ||
            server.status === statusFilter.value;

        const poolMatch =
            poolFilter.value === "All Pools" ||
            server.pool === poolFilter.value;

        return (
            searchMatch &&
            regionMatch &&
            statusMatch &&
            poolMatch
        );

    });

    filtered.forEach((server, index) => {

        table.innerHTML += `

<tr>

<td>${server.name}</td>

<td>${server.pool}</td>

<td>${server.ocpu}</td>

<td>${server.memory} GB</td>

<td>

<span class="${server.status==="Running" ? "running":"stopped"}">

${server.status}

</span>

</td>

<td>${server.region}</td>

<td>

<div class="action-menu">

<button class="menu-btn">

<i class="fa-solid fa-ellipsis-vertical"></i>

</button>

<div class="dropdown">

<button onclick="openServer(${index})">
<i class="fa-solid fa-folder-open"></i>
Open Details
</button>

<button onclick="restartServer(${index})">
<i class="fa-solid fa-rotate-right"></i>
Restart
</button>

<button onclick="deleteServer(${index})">
<i class="fa-solid fa-trash"></i>
Delete
</button>

</div>

</div>

</td>
</tr>

`;

    });

    updateCards();

}

// =========================
// Summary Cards
// =========================

function updateCards(){

let running = 0;
let stopped = 0;
let ocpu = 0;
let memory = 0;

servers.forEach(server=>{

    if(server.status==="Running"){

        running++;

    }else{

        stopped++;

    }

    ocpu += Number(server.ocpu);
    memory += Number(server.memory);

});

document.getElementById("runningCount").innerHTML = running;
document.getElementById("stoppedCount").innerHTML = stopped;
document.getElementById("ocpuCount").innerHTML = ocpu;
document.getElementById("memoryCount").innerHTML = memory + " GB";

}

// =========================
// Search & Filters
// =========================

searchInput.onkeyup = renderTable;

regionFilter.onchange = renderTable;

statusFilter.onchange = renderTable;

poolFilter.onchange = renderTable;

// =========================
// Open Server
// =========================

function openServer(index){

localStorage.setItem(
"selectedServer",
JSON.stringify(servers[index])
);

location.href="database-server-details.html";

}

// =========================
// Restart
// =========================

function restartServer(index){

alert(
servers[index].name + " restarted successfully."
);

}

// =========================
// Delete
// =========================

function deleteServer(index){

if(confirm("Delete this server?")){

servers.splice(index,1);

localStorage.setItem(
"dbServers",
JSON.stringify(servers)
);

renderTable();

}

}

// =========================
// Initialize
// =========================

renderTable();