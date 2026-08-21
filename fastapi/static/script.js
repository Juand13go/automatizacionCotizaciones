const btnListarAsesores = document.getElementById("btnListarAsesores");
const contenedorAsesores = document.getElementById("contenedorAsesores");
const inputAsesorId = document.getElementById("inputAsesorId");
const btnBuscarLeads = document.getElementById("btnBuscarLeads");
const contenedorLeads = document.getElementById("contenedorLeads");

async function listarInformacionAsesores(){
    try {
        const response = await fetch(`/listar_asesores`);

        if(!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const asesores = await response.json();
        console.log("Lista de asesores obtenida: ", asesores);
        return asesores;
    }catch(error){
        console.error("Hubo un error al cargar los asesores. ", error);
    }
}

async function cargarLeadsPorAsesor(idAsesor) {
    try {
        const response = await fetch(`/leads_por_asesor?id_asesor=${idAsesor}`);

        if(!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const leads = await response.json();

        console.log("Lista de leads obtenida: ", leads);
        return leads;
    }catch(error){
        console.error("Hubo un error al cargar los leads. ", error);
    }
}

async function ejecutarCierreLead(idLead, estado) {
    try{
        const response = await fetch('/cerrar_lead', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_lead: idLead,
                estado_lead: estado
            })
        });

        if(!response.ok){
            throw new Error(`No se pudo cerrar el lead. Status: ${response.status}`);
        }

        const resultado = await response.json();

        console.log("Lead cerrado exitosamente: ", resultado);
        return resultado
    } catch(error) {
        console.error("Error al cerrar el lead", error);
    }
}

function renderizarAsesores(listaAsesores){
    contenedorAsesores.innerHTML = "";
    
    if(!listaAsesores || listaAsesores.length === 0){
        contenedorAsesores.innerHTML = "<li>No hay asesores registrados.</li>";
        return; 
    }
    
    listaAsesores.forEach(asesor => {
        const li = document.createElement("li");
        li.textContent = `Asesor: ${asesor.nombre_asesor}, ID: ${asesor.id_asesor}`;
        
        contenedorAsesores.appendChild(li);
    });
}

function renderizarLeads(listaDeLeads){
    contenedorLeads.innerHTML = "";

    if (listaDeLeads.length === 0){
        contenedorLeads.innerHTML = "<li>No hay leads asignados a este asesor.</li>"
        return; 
    }

    listaDeLeads.forEach(lead => {
        const li = document.createElement("li");
        li.textContent = `Lead ID: ${lead.id_lead}, ID Conversacion: ${lead.id_conversacion}, Productos de Interes: ${lead.productos_interes}, Ciudad: ${lead.ciudad}`;
                    
        const btnVenta = document.createElement("button");
        btnVenta.textContent = "Venta";
        btnVenta.style.marginLeft = "10px";
        btnVenta.addEventListener("click", async () => {
            const res = await ejecutarCierreLead(lead.id_lead, "venta");
            if (res) {
                alert(`Lead ${lead.id_lead} cerrado como venta.`);
                refrescarLeads();
            }
        });

        const btnNoVenta = document.createElement("button");
        btnNoVenta.textContent = "No venta";
        btnNoVenta.style.marginLeft = "10px";
        btnNoVenta.addEventListener("click", async () => {
            const res = await ejecutarCierreLead(lead.id_lead, "no_venta");
            if (res) {
                alert(`Lead ${lead.id_lead} cerrado como no venta.`)
                refrescarLeads();
            }
        });
        
        li.appendChild(btnVenta);
        li.appendChild(btnNoVenta);

        contenedorLeads.appendChild(li);
    });
} 

async function refrescarLeads() {
    const idAsesor = inputAsesorId.value.trim();
    if (idAsesor) {
        const leads = await cargarLeadsPorAsesor(idAsesor);
        if (leads) renderizarLeads(leads);
    }
}

btnListarAsesores.addEventListener("click", async () => {
    const asesores = await listarInformacionAsesores();

    if (asesores) {
        renderizarAsesores(asesores);
    }
});

btnBuscarLeads.addEventListener("click", async () => {
    const idAsesor = inputAsesorId.value.trim();

    if(!idAsesor) {
        alert("Por favor ingrese un UUID válido.");
        return; 
    }

    const leads = await cargarLeadsPorAsesor(idAsesor);
    if (leads) {
        renderizarLeads(leads);
    }
});