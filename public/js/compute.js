let instances = JSON.parse(localStorage.getItem("instances")) || [
{
name:"APP-SERVER-01",
state:"Running",
shape:"VM.Standard.E5.Flex",
ip:"10.0.0.15",
region:"India Central",
ocpu:4,
memory:32
},
{
name:"WEB-01",
state:"Stopped",
shape:"VM.Standard.A1.Flex",
ip:"10.0.0.16",
region:"India Central",
ocpu:2,
memory:8
}
];

function renderTable(){

const table=document.getElementById("instanceTable");

table.innerHTML="";

instances.forEach((vm,index)=>{

table.innerHTML+=`

<tr>

<td>${vm.name}</td>

<td class="${
vm.state==="Running"
?"green"
:vm.state==="Stopped"
?"red"
:vm.state==="Starting"
?"blue"
:"orange"
}">
${vm.state}
</td>

<td>${vm.shape}</td>

<td>${vm.ocpu}</td>

<td>${vm.memory} GB</td>

<td>${vm.ip}</td>

<td>

<button onclick="startVM(${index})">Start</button>

<button onclick="stopVM(${index})">Stop</button>

<button onclick="deleteVM(${index})">Delete</button>

</td>

</tr>

`;

});

}

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));



function openPopup(){

document.getElementById("popup").style.display="flex";

}



function closePopup(){

document.getElementById("popup").style.display="none";

}


function createInstance(){

const name=document.getElementById("instanceName").value;
const shape=document.getElementById("shape").value;
const ocpu=document.getElementById("ocpu").value;
const memory=document.getElementById("memory").value;

if(name===""){
    alert("Please enter Instance Name");
    return;
}

const vm={
    name,
    state:"Provisioning",
    shape,
    ocpu,
    memory,
    ip:"Assigning...",
    region:"India Central"
};

instances.push(vm);

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));

closePopup();

document.getElementById("instanceName").value="";
document.getElementById("ocpu").value="";
document.getElementById("memory").value="";

setTimeout(()=>{

vm.state="Starting";

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));

},3000);

setTimeout(()=>{

vm.state="Running";

vm.ip="10.0.0."+Math.floor(Math.random()*200+20);

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));

},6000);

}


function stopVM(index){

instances[index].state="Stopped";

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));

}



function deleteVM(index){

if(confirm("Delete this instance?")){

instances.splice(index,1);

renderTable();
localStorage.setItem("instances",JSON.stringify(instances));

}

}