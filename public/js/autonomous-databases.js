let databases = JSON.parse(localStorage.getItem("autonomousDatabases")) || [];

render();

function render(){

const table=document.getElementById("adbTable");

table.innerHTML="";

databases.forEach((db,index)=>{

table.innerHTML+=`

<tr>

<td>${db.name}</td>

<td>${db.workload}</td>

<td class="${db.status=="Available"?"running":"provisioning"}">

${db.status}

</td>

<td>${db.cpu}</td>

<td>${db.storage} TB</td>

<td>

<button class="action">

Open

</button>

</td>

</tr>

`;

});

}

function openPopup(){

document.getElementById("popup").style.display="flex";

}

function closePopup(){

document.getElementById("popup").style.display="none";

}

function createDatabase(){

const db={

name:document.getElementById("dbName").value,

displayName:document.getElementById("displayName").value,

workload:document.getElementById("workload").value,

cpu:document.getElementById("cpu").value,

storage:document.getElementById("storage").value,

status:"Provisioning"

};

databases.push(db);

localStorage.setItem("autonomousDatabases",JSON.stringify(databases));

render();

closePopup();

setTimeout(()=>{

db.status="Available";

localStorage.setItem("autonomousDatabases",JSON.stringify(databases));

render();

},4000);

}