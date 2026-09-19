/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://apbmzwmqyiyrximydseq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qlgo3bzEfOZJBLLjyTxMkg_0p6v-Z8n";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   DADOS
========================================================= */

let registros = [];
let colaboradores = [];


/* =========================================================
   CARREGAR DADOS DO BANCO
========================================================= */

async function carregarDados() {

    const { data: dadosRegistros, error: erroRegistros } =
        await db
            .from("registros")
            .select("*")
            .order("id", { ascending: true });

    if (erroRegistros) {

        console.error(
            "Erro ao carregar registros:",
            erroRegistros
        );

        alert(
            "Não foi possível carregar os registros do banco de dados."
        );

        return;
    }


    const { data: dadosColaboradores, error: erroColaboradores } =
        await db
            .from("colaboradores")
            .select("*")
            .order("id", { ascending: true });

    if (erroColaboradores) {

        console.error(
            "Erro ao carregar colaboradores:",
            erroColaboradores
        );

        alert(
            "Não foi possível carregar os colaboradores do banco de dados."
        );

        return;
    }


    registros = dadosRegistros || [];

    colaboradores = dadosColaboradores || [];


    atualizarDashboard();

    carregarHistorico();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mostrarPagina(pagina, botao) {

    document.querySelectorAll(".pagina").forEach(section => {

        section.classList.remove("active");

    });


    document.querySelectorAll(".menu-btn").forEach(button => {

        button.classList.remove("active");

    });


    document
        .getElementById(pagina)
        .classList.add("active");


    if (botao) {

        botao.classList.add("active");

    }


    if (pagina === "dashboard") {

        atualizarDashboard();

    }


    if (pagina === "colaboradores") {

        carregarColaboradores();

    }


    if (pagina === "historico") {

        carregarHistorico();

    }

}


/* =========================================================
   CADASTRO DE COLABORADORES
========================================================= */

async function cadastrarColaborador() {

    const lms = document
        .getElementById("cadastroLms")
        .value
        .trim();


    const nome = document
        .getElementById("cadastroNome")
        .value
        .trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome do colaborador."
        );

        return;
    }


    const lmsNormalizado = lms.toLowerCase();


    const existente = colaboradores.find(
        colaborador =>
            colaborador.lms.toLowerCase() ===
            lmsNormalizado
    );


    if (existente) {

        alert(
            "Este LMS já está cadastrado."
        );

        return;
    }


    const { data, error } = await db
        .from("colaboradores")
        .insert([
            {
                lms: lms,
                nome: nome
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao cadastrar colaborador:",
            error
        );

        alert(
            "Erro ao cadastrar colaborador."
        );

        return;
    }


    colaboradores.push(data);


    document.getElementById(
        "cadastroLms"
    ).value = "";


    document.getElementById(
        "cadastroNome"
    ).value = "";


    carregarColaboradores();

}


/* =========================================================
   LISTAR COLABORADORES
========================================================= */

async function carregarColaboradores() {

    const campo = document
        .getElementById("buscaColaborador");


    if (!campo) return;


    const termo = campo
        .value
        .trim()
        .toLowerCase();


    const { data, error } = await db
        .from("colaboradores")
        .select("*")
        .order("id", { ascending: true });


    if (error) {

        console.error(
            "Erro ao carregar colaboradores:",
            error
        );

        return;
    }


    colaboradores = data || [];


    let lista = colaboradores;


    if (termo) {

        lista = colaboradores.filter(
            colaborador =>

                colaborador.lms
                    .toLowerCase()
                    .includes(termo)

                ||

                colaborador.nome
                    .toLowerCase()
                    .includes(termo)
        );

    }


    const tabela = document
        .getElementById(
            "tabelaColaboradores"
        );


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="3">
                    Nenhum colaborador encontrado.
                </td>

            </tr>

        `;

        return;
    }


    tabela.innerHTML = lista
        .slice()
        .reverse()
        .map(colaborador => `

            <tr>

                <td>
                    ${escaparHTML(colaborador.lms)}
                </td>

                <td>
                    ${escaparHTML(colaborador.nome)}
                </td>

                <td>

                    <button
                        class="btn-editar"
                        onclick="abrirEdicaoColaborador(${colaborador.id})"
                    >
                        Editar
                    </button>


                    <button
                        class="btn-excluir"
                        onclick="excluirColaborador(${colaborador.id})"
                    >
                        Excluir
                    </button>

                </td>

            </tr>

        `)
        .join("");

}


/* =========================================================
   MOSTRAR TODOS OS COLABORADORES
========================================================= */

function mostrarTodosColaboradores() {

    document.getElementById(
        "buscaColaborador"
    ).value = "";


    carregarColaboradores();

}


/* =========================================================
   BUSCAR NOME POR LMS
========================================================= */

function buscarNomePorLms() {

    const campoLms = document
        .getElementById("lms");


    const campoNome = document
        .getElementById("nome");


    const status = document
        .getElementById("statusLms");


    const lms = campoLms
        .value
        .trim()
        .toLowerCase();


    campoNome.value = "";

    status.textContent = "";

    status.className = "status-lms";


    if (!lms) {

        return;
    }


    const colaborador = colaboradores.find(
        item =>
            item.lms.toLowerCase() === lms
    );


    if (colaborador) {

        campoNome.value =
            colaborador.nome;


        status.textContent =
            "Colaborador encontrado";


        status.classList.add(
            "sucesso"
        );

    } else {

        status.textContent =
            "LMS não cadastrado";


        status.classList.add(
            "erro"
        );

    }

}


/* =========================================================
   REGISTRAR RETIRADA
========================================================= */

async function registrarRetirada() {

    const lms = document
        .getElementById("lms")
        .value
        .trim();


    const nome = document
        .getElementById("nome")
        .value
        .trim();


    const codigo = document
        .getElementById("codigo")
        .value
        .trim();


    const observacao = document
        .getElementById("observacao")
        .value
        .trim();


    if (!lms || !codigo) {

        alert(
            "Preencha o LMS e o código do equipamento."
        );

        return;
    }


    if (!nome) {

        alert(
            "O LMS informado não está cadastrado. Cadastre o colaborador primeiro."
        );

        return;
    }


    const { data: equipamentoExistente, error: erroBusca } =
        await db
            .from("registros")
            .select("*")
            .ilike("codigo", codigo)
            .eq("status", "retirado")
            .limit(1);


    if (erroBusca) {

        console.error(
            "Erro ao verificar equipamento:",
            erroBusca
        );

        alert(
            "Erro ao verificar o equipamento."
        );

        return;
    }


    if (
        equipamentoExistente &&
        equipamentoExistente.length > 0
    ) {

        alert(
            "Este equipamento já está registrado como retirado."
        );

        return;
    }


    const { data, error } = await db
        .from("registros")
        .insert([
            {
                lms: lms,
                nome: nome,
                codigo: codigo,
                observacao: observacao || null,
                retirada: new Date().toISOString(),
                devolucao: null,
                status: "retirado"
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao registrar retirada:",
            error
        );

        alert(
            "Erro ao registrar a retirada."
        );

        return;
    }


    registros.push(data);


    document.getElementById("lms").value = "";

    document.getElementById("nome").value = "";

    document.getElementById("codigo").value = "";

    document.getElementById("observacao").value = "";

    document.getElementById("statusLms").textContent = "";

    document.getElementById("statusLms").className =
        "status-lms";


    atualizarDashboard();

    carregarHistorico();

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const retirados = registros.filter(
        item => item.status === "retirado"
    ).length;


    const devolvidos = registros.filter(
        item => item.status === "devolvido"
    ).length;


    const extraviados = registros.filter(
        item => item.status === "extraviado"
    ).length;


    document.getElementById(
        "totalRetirados"
    ).textContent = retirados;


    document.getElementById(
        "totalDevolvidos"
    ).textContent = devolvidos;


    document.getElementById(
        "totalExtraviados"
    ).textContent = extraviados;

}


/* =========================================================
   BUSCA DASHBOARD
========================================================= */

function buscarDashboard() {

    const termo = document
        .getElementById("buscaDashboard")
        .value
        .trim()
        .toLowerCase();


    const resultado = document
        .getElementById(
            "resultadoDashboard"
        );


    if (!termo) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(
        item =>

            item.lms
                .toLowerCase()
                .includes(termo)

            ||

            item.nome
                .toLowerCase()
                .includes(termo)

            ||

            item.codigo
                .toLowerCase()
                .includes(termo)
    );


    if (!encontrados.length) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML =
        encontrados
            .map(item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(item.nome)}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(item.lms)}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(item.codigo)}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </div>

                    <div>
                        Retirada:
                        ${formatarData(item.retirada)}
                    </div>

                    <div>
                        Devolução:
                        ${
                            item.devolucao
                            ? formatarData(item.devolucao)
                            : "-"
                        }
                    </div>

                    ${
                        item.observacao
                        ?
                        `
                            <div>
                                Observação:
                                ${escaparHTML(item.observacao)}
                            </div>
                        `
                        :
                        ""
                    }

                </div>

            `)
            .join("");

}


/* =========================================================
   BUSCA NA RETIRADA
========================================================= */

function buscarRetirada() {

    const lms = document
        .getElementById("lms")
        .value
        .trim()
        .toLowerCase();


    const codigo = document
        .getElementById("codigo")
        .value
        .trim()
        .toLowerCase();


    const nome = document
        .getElementById("nome")
        .value
        .trim()
        .toLowerCase();


    const resultado = document
        .getElementById(
            "resultadoRetirada"
        );


    if (!lms && !codigo && !nome) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(
        item =>

            (lms &&
                item.lms
                    .toLowerCase()
                    .includes(lms))

            ||

            (codigo &&
                item.codigo
                    .toLowerCase()
                    .includes(codigo))

            ||

            (nome &&
                item.nome
                    .toLowerCase()
                    .includes(nome))
    );


    if (!encontrados.length) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML =
        encontrados
            .map(item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(item.nome)}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(item.lms)}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(item.codigo)}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </div>


                    ${
                        item.observacao
                        ?
                        `
                            <div>
                                Observação:
                                ${escaparHTML(item.observacao)}
                            </div>
                        `
                        :
                        ""
                    }


                    <br>


                    <button
                        class="btn-editar"
                        onclick="abrirEdicao(${item.id})"
                    >
                        Editar
                    </button>

                </div>

            `)
            .join("");

}


/* =========================================================
   HISTÓRICO
========================================================= */

async function carregarHistorico() {

    const campo = document
        .getElementById("buscaHistorico");


    if (!campo) return;


    const termo = campo
        .value
        .trim()
        .toLowerCase();


    const { data, error } = await db
        .from("registros")
        .select("*")
        .order("id", { ascending: true });


    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );

        return;
    }


    registros = data || [];


    let lista = registros;


    if (termo) {

        lista = registros.filter(
            item =>

                item.lms
                    .toLowerCase()
                    .includes(termo)

                ||

                item.nome
                    .toLowerCase()
                    .includes(termo)

                ||

                item.codigo
                    .toLowerCase()
                    .includes(termo)
        );

    }


    const tabela = document
        .getElementById(
            "tabelaHistorico"
        );


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;

        return;
    }


    tabela.innerHTML =
        lista
            .slice()
            .reverse()
            .map(item => `

                <tr>

                    <td>
                        ${escaparHTML(item.lms)}
                    </td>


                    <td>
                        ${escaparHTML(item.nome)}
                    </td>


                    <td>
                        ${escaparHTML(item.codigo)}
                    </td>


                    <td>
                        ${formatarData(item.retirada)}
                    </td>


                    <td>
                        ${
                            item.devolucao
                            ? formatarData(item.devolucao)
                            : "-"
                        }
                    </td>


                    <td>

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </td>


                    <td class="observacao-tabela">

                        ${
                            item.observacao
                            ? escaparHTML(item.observacao)
                            : "-"
                        }

                    </td>


                    <td>

                        <button
                            class="btn-editar"
                            onclick="abrirEdicao(${item.id})"
                        >
                            Editar
                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirRegistro(${item.id})"
                        >
                            Excluir
                        </button>

                    </td>

                </tr>

            `)
            .join("");

}


/* =========================================================
   MOSTRAR TODOS
========================================================= */

function mostrarTodos() {

    document.getElementById(
        "buscaHistorico"
    ).value = "";


    carregarHistorico();

}


/* =========================================================
   EDITAR REGISTRO
========================================================= */

function abrirEdicao(id) {

    const registro = registros.find(
        item => Number(item.id) === Number(id)
    );


    if (!registro) return;


    document.getElementById(
        "editarId"
    ).value = registro.id;


    document.getElementById(
        "editarLms"
    ).value = registro.lms;


    document.getElementById(
        "editarNome"
    ).value = registro.nome;


    document.getElementById(
        "editarCodigo"
    ).value = registro.codigo;


    document.getElementById(
        "editarStatus"
    ).value = registro.status;


    document.getElementById(
        "editarObservacao"
    ).value =
        registro.observacao || "";


    document
        .getElementById("modalEdicao")
        .classList.add("aberto");

}


async function salvarEdicao() {

    const id = Number(
        document.getElementById(
            "editarId"
        ).value
    );


    const lms = document
        .getElementById("editarLms")
        .value
        .trim();


    const nome = document
        .getElementById("editarNome")
        .value
        .trim();


    const codigo = document
        .getElementById("editarCodigo")
        .value
        .trim();


    const observacao = document
        .getElementById("editarObservacao")
        .value
        .trim();


    const novoStatus =
        document.getElementById(
            "editarStatus"
        ).value;


    if (!lms || !nome || !codigo) {

        alert(
            "Preencha o LMS, nome e código do equipamento."
        );

        return;
    }


    const registro = registros.find(
        item => Number(item.id) === id
    );


    if (!registro) return;


    let devolucao = registro.devolucao;


    if (
        novoStatus === "devolvido" &&
        !devolucao
    ) {

        devolucao =
            new Date().toISOString();

    }


    if (
        novoStatus !== "devolvido"
    ) {

        devolucao = null;

    }


    const { data, error } = await db
        .from("registros")
        .update({

            lms: lms,

            nome: nome,

            codigo: codigo,

            observacao:
                observacao || null,

            status: novoStatus,

            devolucao: devolucao

        })
        .eq("id", id)
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao editar registro:",
            error
        );

        alert(
            "Erro ao salvar as alterações."
        );

        return;
    }


    const indice = registros.findIndex(
        item => Number(item.id) === id
    );


    if (indice !== -1) {

        registros[indice] = data;

    }


    fecharModal();

    atualizarDashboard();

    carregarHistorico();

}


/* =========================================================
   FECHAR MODAL DE REGISTRO
========================================================= */

function fecharModal() {

    document
        .getElementById("modalEdicao")
        .classList.remove("aberto");

}


/* =========================================================
   EXCLUIR REGISTRO
========================================================= */

async function excluirRegistro(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este registro?"
    );


    if (!confirmar) return;


    const { error } = await db
        .from("registros")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Erro ao excluir registro:",
            error
        );

        alert(
            "Erro ao excluir o registro."
        );

        return;
    }


    registros = registros.filter(
        item => Number(item.id) !== Number(id)
    );


    atualizarDashboard();

    carregarHistorico();

}


/* =========================================================
   EDITAR COLABORADOR
========================================================= */

function abrirEdicaoColaborador(id) {

    const colaborador =
        colaboradores.find(
            item => Number(item.id) === Number(id)
        );


    if (!colaborador) return;


    document.getElementById(
        "editarColaboradorId"
    ).value = colaborador.id;


    document.getElementById(
        "editarColaboradorLms"
    ).value = colaborador.lms;


    document.getElementById(
        "editarColaboradorNome"
    ).value = colaborador.nome;


    document
        .getElementById(
            "modalColaborador"
        )
        .classList.add("aberto");

}


async function salvarEdicaoColaborador() {

    const id = Number(
        document.getElementById(
            "editarColaboradorId"
        ).value
    );


    const lms = document
        .getElementById(
            "editarColaboradorLms"
        )
        .value
        .trim();


    const nome = document
        .getElementById(
            "editarColaboradorNome"
        )
        .value
        .trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome."
        );

        return;
    }


    const outroColaborador =
        colaboradores.find(
            item =>
                Number(item.id) !== id &&
                item.lms.toLowerCase() ===
                lms.toLowerCase()
        );


    if (outroColaborador) {

        alert(
            "Este LMS já pertence a outro colaborador."
        );

        return;
    }


    const colaborador =
        colaboradores.find(
            item => Number(item.id) === id
        );


    if (!colaborador) return;


    const lmsAntigo =
        colaborador.lms;


    const { error: erroColaborador } =
        await db
            .from("colaboradores")
            .update({

                lms: lms,

                nome: nome

            })
            .eq("id", id);


    if (erroColaborador) {

        console.error(
            "Erro ao editar colaborador:",
            erroColaborador
        );

        alert(
            "Erro ao salvar o colaborador."
        );

        return;
    }


    /*
       Atualiza também os registros antigos
       desse colaborador.
    */

    const { error: erroRegistros } =
        await db
            .from("registros")
            .update({

                lms: lms,

                nome: nome

            })
            .ilike("lms", lmsAntigo);


    if (erroRegistros) {

        console.error(
            "Erro ao atualizar registros:",
            erroRegistros
        );

        alert(
            "O colaborador foi atualizado, mas ocorreu um erro ao atualizar os registros antigos."
        );

    }


    colaboradores =
        colaboradores.map(item => {

            if (Number(item.id) === id) {

                return {
                    ...item,
                    lms: lms,
                    nome: nome
                };

            }

            return item;

        });


    registros =
        registros.map(item => {

            if (
                item.lms.toLowerCase() ===
                lmsAntigo.toLowerCase()
            ) {

                return {
                    ...item,
                    lms: lms,
                    nome: nome
                };

            }

            return item;

        });


    fecharModalColaborador();

    carregarColaboradores();

    carregarHistorico();

    atualizarDashboard();

}


/* =========================================================
   FECHAR MODAL DE COLABORADOR
========================================================= */

function fecharModalColaborador() {

    document
        .getElementById(
            "modalColaborador"
        )
        .classList.remove("aberto");

}


/* =========================================================
   EXCLUIR COLABORADOR
========================================================= */

async function excluirColaborador(id) {

    const colaborador =
        colaboradores.find(
            item => Number(item.id) === Number(id)
        );


    if (!colaborador) return;


    const confirmar = confirm(

        `Deseja excluir o colaborador ${colaborador.nome}?`

    );


    if (!confirmar) return;


    const { error } = await db
        .from("colaboradores")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Erro ao excluir colaborador:",
            error
        );

        alert(
            "Erro ao excluir o colaborador."
        );

        return;
    }


    colaboradores =
        colaboradores.filter(
            item => Number(item.id) !== Number(id)
        );


    carregarColaboradores();

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarStatus(status) {

    const nomes = {

        retirado: "Retirado",

        devolvido: "Devolvido",

        extraviado: "Extraviado"

    };


    return nomes[status] || status;

}


function formatarData(data) {

    if (!data) return "-";


    return new Date(data)
        .toLocaleString(
            "pt-BR",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }
        );

}


/* =========================================================
   SEGURANÇA BÁSICA
========================================================= */

function escaparHTML(texto) {

    if (
        texto === undefined ||
        texto === null
    ) {

        return "";

    }


    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await carregarDados();

    }
);
