/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://dfqclkfqdzfsftnmzejx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_IV8xYF0qDVVYAxhSgSjqtg_mreIReGf";

let db = null;


/* =========================================================
   DADOS
========================================================= */

let registros = [];
let colaboradores = [];


/* =========================================================
   PAGINAÇÃO
========================================================= */

const REGISTROS_POR_PAGINA = 40;

let paginaHistoricoAtual = 1;


/* =========================================================
   SELEÇÃO DO HISTÓRICO
========================================================= */

let registrosSelecionados = new Set();


/* =========================================================
   FILTRO DE DATA
========================================================= */

let filtroDataHistorico = {
    dia: "",
    mes: "",
    ano: ""
};

let calendarioDataAtual = new Date();


const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];


/* =========================================================
   INICIALIZAR SUPABASE
========================================================= */

function inicializarSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "ERRO: biblioteca do Supabase não foi carregada."
        );

        return false;

    }


    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


    console.log(
        "Supabase conectado com sucesso."
    );


    return true;

}


/* =========================================================
   CARREGAR DADOS DO BANCO
========================================================= */

async function carregarDados() {

    if (!db) {

        console.error(
            "Supabase não inicializado."
        );

        return;

    }


    try {

        const {
            data: dadosRegistros,
            error: erroRegistros
        } = await db
            .from("registros")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (erroRegistros) {

            console.error(
                "Erro em registros:",
                erroRegistros
            );

            alert(
                "Erro ao carregar os registros."
            );

            return;

        }


        const {
            data: dadosColaboradores,
            error: erroColaboradores
        } = await db
            .from("colaboradores")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (erroColaboradores) {

            console.error(
                "Erro em colaboradores:",
                erroColaboradores
            );

            alert(
                "Erro ao carregar os colaboradores."
            );

            return;

        }


        registros =
            dadosRegistros || [];


        colaboradores =
            dadosColaboradores || [];


        atualizarDashboard();

        inicializarFiltroDataHistorico();

    }
    catch (erro) {

        console.error(
            "Erro inesperado ao carregar dados:",
            erro
        );

        alert(
            "Não foi possível carregar os dados do sistema."
        );

    }

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mostrarPagina(
    pagina,
    botao
) {

    document
        .querySelectorAll(".pagina")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(".menu-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const paginaElemento =
        document.getElementById(
            pagina
        );


    if (paginaElemento) {

        paginaElemento.classList.add(
            "active"
        );

    }


    if (botao) {

        botao.classList.add(
            "active"
        );

    }


    if (
        pagina ===
        "dashboard"
    ) {

        atualizarDashboard();

    }


    if (
        pagina ===
        "colaboradores"
    ) {

        carregarColaboradores();

    }


    if (
        pagina ===
        "historico"
    ) {

        paginaHistoricoAtual = 1;

        inicializarFiltroDataHistorico();

        carregarHistorico(
            true
        );

    }

}


/* =========================================================
   CADASTRO DE COLABORADORES
========================================================= */

async function cadastrarColaborador() {

    const campoLms =
        document.getElementById(
            "cadastroLms"
        );


    const campoNome =
        document.getElementById(
            "cadastroNome"
        );


    if (
        !campoLms ||
        !campoNome
    ) {

        return;

    }


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    if (
        !lms ||
        !nome
    ) {

        alert(
            "Preencha o LMS e o nome do colaborador."
        );

        return;

    }


    const existente =
        colaboradores.find(
            colaborador =>
                normalizarTexto(
                    colaborador.lms
                ) ===
                normalizarTexto(
                    lms
                )
        );


    if (existente) {

        alert(
            "Este LMS já está cadastrado."
        );

        return;

    }


    const {
        data,
        error
    } = await db
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


    colaboradores.push(
        data
    );


    campoLms.value = "";

    campoNome.value = "";


    await carregarColaboradores();

}


/* =========================================================
   LISTAR COLABORADORES
========================================================= */

async function carregarColaboradores() {

    const campo =
        document.getElementById(
            "buscaColaborador"
        );


    const tabela =
        document.getElementById(
            "tabelaColaboradores"
        );


    if (
        !campo ||
        !tabela
    ) {

        return;

    }


    const termo =
        normalizarTexto(
            campo.value
        );


    const {
        data,
        error
    } = await db
        .from("colaboradores")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Erro ao carregar colaboradores:",
            error
        );

        return;

    }


    colaboradores =
        data || [];


    let lista =
        colaboradores;


    if (termo) {

        lista =
            colaboradores.filter(
                colaborador =>

                    normalizarTexto(
                        colaborador.lms
                    ).includes(
                        termo
                    )

                    ||

                    normalizarTexto(
                        colaborador.nome
                    ).includes(
                        termo
                    )
            );

    }


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


    tabela.innerHTML =
        lista
            .slice()
            .reverse()
            .map(
                colaborador => `

                <tr>

                    <td>
                        ${escaparHTML(
                            colaborador.lms
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            colaborador.nome
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-editar"
                            onclick="abrirEdicaoColaborador(${Number(
                                colaborador.id
                            )})"
                        >
                            Editar
                        </button>

                        <button
                            class="btn-excluir"
                            onclick="excluirColaborador(${Number(
                                colaborador.id
                            )})"
                        >
                            Excluir
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


/* =========================================================
   MOSTRAR TODOS OS COLABORADORES
========================================================= */

function mostrarTodosColaboradores() {

    const campo =
        document.getElementById(
            "buscaColaborador"
        );


    if (!campo) {

        return;

    }


    campo.value = "";

    carregarColaboradores();

}


/* =========================================================
   BUSCAR NOME POR LMS
========================================================= */

function buscarNomePorLms() {

    const campoLms =
        document.getElementById(
            "lms"
        );


    const campoNome =
        document.getElementById(
            "nome"
        );


    const status =
        document.getElementById(
            "statusLms"
        );


    if (
        !campoLms ||
        !campoNome ||
        !status
    ) {

        return;

    }


    const lmsDigitado =
        String(
            campoLms.value || ""
        )
            .replace(
                /[\r\n\t]/g,
                ""
            )
            .trim();


    const lms =
        normalizarTexto(
            lmsDigitado
        );


    campoNome.value = "";

    status.textContent = "";

    status.className =
        "status-lms";


    if (!lms) {

        return;

    }


    const colaborador =
        colaboradores.find(
            item => {

                const lmsCadastrado =
                    normalizarTexto(
                        String(
                            item.lms || ""
                        )
                            .replace(
                                /[\r\n\t]/g,
                                ""
                            )
                            .trim()
                    );


                return (
                    lmsCadastrado ===
                    lms
                );

            }
        );


    if (colaborador) {

        campoNome.value =
            colaborador.nome || "";


        status.textContent =
            "Colaborador encontrado";


        status.classList.add(
            "sucesso"
        );

    }
    else {

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

    const campoLms =
        document.getElementById(
            "lms"
        );


    const campoNome =
        document.getElementById(
            "nome"
        );


    const campoCodigo =
        document.getElementById(
            "codigo"
        );


    const campoObservacao =
        document.getElementById(
            "observacao"
        );


    if (
        !campoLms ||
        !campoNome ||
        !campoCodigo ||
        !campoObservacao
    ) {

        return;

    }


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    const codigo =
        campoCodigo.value.trim();


    const observacao =
        campoObservacao.value.trim();


    if (
        !lms ||
        !codigo
    ) {

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


    const colaborador =
        colaboradores.find(
            item =>
                normalizarTexto(
                    item.lms
                ) ===
                normalizarTexto(
                    lms
                )
        );


    if (!colaborador) {

        alert(
            "O LMS informado não está cadastrado. Cadastre o colaborador primeiro."
        );

        return;

    }


    const {
        data: equipamentoExistente,
        error: erroBusca
    } = await db
        .from("registros")
        .select(
            "id, codigo, status"
        )
        .ilike(
            "codigo",
            codigo
        )
        .eq(
            "status",
            "retirado"
        )
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


    const {
        data,
        error
    } = await db
        .from("registros")
        .insert([
            {
                lms:
                    colaborador.lms,

                nome:
                    colaborador.nome,

                codigo:
                    codigo,

                observacao:
                    observacao || null,

                retirada:
                    new Date().toISOString(),

                devolucao:
                    null,

                status:
                    "retirado"
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao registrar retirada:",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            alert(
                "Este equipamento já está registrado como retirado."
            );

        }
        else {

            alert(
                "Erro ao registrar a retirada."
            );

        }

        return;

    }


    registros.push(
        data
    );


    atualizarDashboard();

    paginaHistoricoAtual = 1;

    await carregarHistorico(
        true
    );


    campoLms.value = "";

    campoNome.value = "";

    campoCodigo.value = "";

    campoObservacao.value = "";


    const statusLms =
        document.getElementById(
            "statusLms"
        );


    if (statusLms) {

        statusLms.textContent = "";

        statusLms.className =
            "status-lms";

    }


    const mensagem =
        document.getElementById(
            "mensagemRetirada"
        );


    if (mensagem) {

        mensagem.innerHTML = `

            <div class="mensagem-sucesso">

                ✓ Retirada registrada com sucesso!

                <br>

                Equipamento:

                <strong>
                    ${escaparHTML(
                        data.codigo
                    )}
                </strong>

            </div>

        `;


        setTimeout(
            () => {

                mensagem.innerHTML = "";

            },
            2000
        );

    }


    campoLms.focus();

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const retirados =
        registros.filter(
            item =>
                item.status ===
                "retirado"
        ).length;


    const devolvidos =
        registros.filter(
            item =>
                item.status ===
                "devolvido"
        ).length;


    const extraviados =
        registros.filter(
            item =>
                item.status ===
                "extraviado"
        ).length;


    const totalRetirados =
        document.getElementById(
            "totalRetirados"
        );


    const totalDevolvidos =
        document.getElementById(
            "totalDevolvidos"
        );


    const totalExtraviados =
        document.getElementById(
            "totalExtraviados"
        );


    if (totalRetirados) {

        totalRetirados.textContent =
            retirados;

    }


    if (totalDevolvidos) {

        totalDevolvidos.textContent =
            devolvidos;

    }


    if (totalExtraviados) {

        totalExtraviados.textContent =
            extraviados;

    }

}


/* =========================================================
   BUSCA DASHBOARD
========================================================= */

function buscarDashboard() {

    const campo =
        document.getElementById(
            "buscaDashboard"
        );


    const resultado =
        document.getElementById(
            "resultadoDashboard"
        );


    if (
        !campo ||
        !resultado
    ) {

        return;

    }


    const termo =
        normalizarTexto(
            campo.value
        );


    if (!termo) {

        resultado.innerHTML = "";

        return;

    }


    const encontrados =
        registros.filter(
            item =>

                normalizarTexto(
                    item.lms
                ).includes(
                    termo
                )

                ||

                normalizarTexto(
                    item.nome
                ).includes(
                    termo
                )

                ||

                normalizarTexto(
                    item.codigo
                ).includes(
                    termo
                )
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
            .map(
                item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(
                            item.nome
                        )}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(
                            item.lms
                        )}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(
                            item.codigo
                        )}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${escaparHTML(
                                item.status
                            )}"
                        >
                            ${escaparHTML(
                                formatarStatus(
                                    item.status
                                )
                            )}
                        </span>

                    </div>

                    <div>
                        Retirada:
                        ${formatarData(
                            item.retirada
                        )}
                    </div>

                    <div>
                        Devolução:
                        ${
                            item.devolucao
                                ? formatarData(
                                    item.devolucao
                                )
                                : "-"
                        }
                    </div>

                    ${
                        item.observacao
                            ? `
                                <div>
                                    Observação:
                                    ${escaparHTML(
                                        item.observacao
                                    )}
                                </div>
                            `
                            : ""
                    }

                </div>

            `
            )
            .join("");

}


/* =========================================================
   BUSCA NA RETIRADA
========================================================= */

function buscarRetirada() {

    const campoLms =
        document.getElementById(
            "lms"
        );


    const campoCodigo =
        document.getElementById(
            "codigo"
        );


    const campoNome =
        document.getElementById(
            "nome"
        );


    const resultado =
        document.getElementById(
            "resultadoRetirada"
        );


    if (
        !campoLms ||
        !campoCodigo ||
        !campoNome ||
        !resultado
    ) {

        return;

    }


    const lms =
        normalizarTexto(
            campoLms.value
        );


    const codigo =
        normalizarTexto(
            campoCodigo.value
        );


    const nome =
        normalizarTexto(
            campoNome.value
        );


    if (
        !lms &&
        !codigo &&
        !nome
    ) {

        resultado.innerHTML = "";

        return;

    }


    const encontrados =
        registros.filter(
            item => {

                if (
                    item.status !==
                    "retirado"
                ) {

                    return false;

                }


                return (

                    (
                        lms &&
                        normalizarTexto(
                            item.lms
                        ).includes(
                            lms
                        )
                    )

                    ||

                    (
                        codigo &&
                        normalizarTexto(
                            item.codigo
                        ).includes(
                            codigo
                        )
                    )

                    ||

                    (
                        nome &&
                        normalizarTexto(
                            item.nome
                        ).includes(
                            nome
                        )
                    )

                );

            }
        );


    if (!encontrados.length) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum equipamento retirado encontrado.
            </div>

        `;

        return;

    }


    resultado.innerHTML =
        encontrados
            .map(
                item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(
                            item.nome
                        )}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(
                            item.lms
                        )}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(
                            item.codigo
                        )}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${escaparHTML(
                                item.status
                            )}"
                        >
                            ${escaparHTML(
                                formatarStatus(
                                    item.status
                                )
                            )}
                        </span>

                    </div>

                    ${
                        item.observacao
                            ? `
                                <div>
                                    Observação:
                                    ${escaparHTML(
                                        item.observacao
                                    )}
                                </div>
                            `
                            : ""
                    }

                    <br>

                    <button
                        class="btn-editar"
                        onclick="abrirEdicao(${Number(
                            item.id
                        )})"
                    >
                        Editar
                    </button>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   HISTÓRICO
========================================================= */

async function carregarHistorico(
    resetarPagina = false
) {

    const campo =
        document.getElementById(
            "buscaHistorico"
        );


    const tabela =
        document.getElementById(
            "tabelaHistorico"
        );


    if (
        !campo ||
        !tabela
    ) {

        return;

    }


    if (resetarPagina) {

        paginaHistoricoAtual = 1;

        registrosSelecionados.clear();

    }


    const termo =
        normalizarTexto(
            campo.value
        );


    const filtroStatus =
        document.getElementById(
            "filtroStatusHistorico"
        );


    const statusSelecionado =
        filtroStatus
            ? filtroStatus.value
            : "";


    const {
        data,
        error
    } = await db
        .from("registros")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );

        return;

    }


    registros =
        data || [];


    let lista =
        registros.filter(
            item => {

                /* BUSCA */

                if (termo) {

                    const encontrouTexto =

                        normalizarTexto(
                            item.lms
                        ).includes(
                            termo
                        )

                        ||

                        normalizarTexto(
                            item.nome
                        ).includes(
                            termo
                        )

                        ||

                        normalizarTexto(
                            item.codigo
                        ).includes(
                            termo
                        );


                    if (!encontrouTexto) {

                        return false;

                    }

                }


                /* STATUS */

                if (
                    statusSelecionado &&
                    item.status !==
                        statusSelecionado
                ) {

                    return false;

                }


                /* DATA */

                if (
                    filtroDataHistorico.dia ||
                    filtroDataHistorico.mes ||
                    filtroDataHistorico.ano
                ) {

                    if (!item.retirada) {

                        return false;

                    }


                    const dataRetirada =
                        new Date(
                            item.retirada
                        );


                    if (
                        Number.isNaN(
                            dataRetirada.getTime()
                        )
                    ) {

                        return false;

                    }


                    const dia =
                        String(
                            dataRetirada.getDate()
                        );


                    const mes =
                        String(
                            dataRetirada.getMonth() + 1
                        );


                    const ano =
                        String(
                            dataRetirada.getFullYear()
                        );


                    if (
                        filtroDataHistorico.dia &&
                        dia !==
                            filtroDataHistorico.dia
                    ) {

                        return false;

                    }


                    if (
                        filtroDataHistorico.mes &&
                        mes !==
                            filtroDataHistorico.mes
                    ) {

                        return false;

                    }


                    if (
                        filtroDataHistorico.ano &&
                        ano !==
                            filtroDataHistorico.ano
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="9">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;


        atualizarPaginacaoHistorico(0);

        atualizarControleSelecaoHistorico([]);

        atualizarDashboard();

        return;

    }


    const listaOrdenada =
        lista
            .slice()
            .reverse();


    const totalPaginas =
        Math.ceil(
            listaOrdenada.length /
            REGISTROS_POR_PAGINA
        );


    if (
        paginaHistoricoAtual <
        1
    ) {

        paginaHistoricoAtual = 1;

    }


    if (
        paginaHistoricoAtual >
        totalPaginas
    ) {

        paginaHistoricoAtual =
            totalPaginas;

    }


    const inicio =
        (
            paginaHistoricoAtual -
            1
        ) *
        REGISTROS_POR_PAGINA;


    const fim =
        inicio +
        REGISTROS_POR_PAGINA;


    const listaPagina =
        listaOrdenada.slice(
            inicio,
            fim
        );


    tabela.innerHTML =
        listaPagina
            .map(
                item => {

                    const id =
                        Number(
                            item.id
                        );


                    const selecionado =
                        registrosSelecionados.has(
                            id
                        );


                    return `

                        <tr>

                            <td style="text-align: center;">

                                <input
                                    type="checkbox"
                                    class="check-registro-historico checkbox-registro"
                                    value="${id}"
                                    ${
                                        selecionado
                                            ? "checked"
                                            : ""
                                    }
                                    onchange="alternarSelecaoRegistro(${id}, this.checked)"
                                    title="Selecionar este registro"
                                >

                            </td>


                            <td>
                                ${escaparHTML(
                                    item.lms
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    item.nome
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    item.codigo
                                )}
                            </td>


                            <td>
                                ${formatarData(
                                    item.retirada
                                )}
                            </td>


                            <td>
                                ${
                                    item.devolucao
                                        ? formatarData(
                                            item.devolucao
                                        )
                                        : "-"
                                }
                            </td>


                            <td>

                                <span
                                    class="status ${escaparHTML(
                                        item.status
                                    )}"
                                >
                                    ${escaparHTML(
                                        formatarStatus(
                                            item.status
                                        )
                                    )}
                                </span>

                            </td>


                            <td class="observacao-tabela">

                                ${
                                    item.observacao
                                        ? escaparHTML(
                                            item.observacao
                                        )
                                        : "-"
                                }

                            </td>


                            <td>

                                <button
                                    class="btn-editar"
                                    onclick="abrirEdicao(${id})"
                                >
                                    Editar
                                </button>


                                <button
                                    class="btn-excluir"
                                    onclick="excluirRegistro(${id})"
                                >
                                    Excluir
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    atualizarPaginacaoHistorico(
        listaOrdenada.length
    );


    atualizarControleSelecaoHistorico(
        listaPagina
    );

}


/* =========================================================
   FILTRO DE DATA
========================================================= */

function inicializarFiltroDataHistorico() {

    const anoSelect =
        document.getElementById(
            "anoFiltroCalendarioHistorico"
        );


    if (!anoSelect) {

        return;

    }


    const anos =
        new Set();


    const anoAtual =
        new Date().getFullYear();


    anos.add(
        String(anoAtual)
    );


    registros.forEach(
        item => {

            if (!item.retirada) {

                return;

            }


            const data =
                new Date(
                    item.retirada
                );


            if (
                !Number.isNaN(
                    data.getTime()
                )
            ) {

                anos.add(
                    String(
                        data.getFullYear()
                    )
                );

            }

        }
    );


    const valorAtual =
        anoSelect.value;


    const listaAnos =
        Array.from(
            anos
        ).sort(
            (a, b) =>
                Number(b) -
                Number(a)
        );


    anoSelect.innerHTML = `

        <option value="">
            Todos
        </option>

        ${
            listaAnos
                .map(
                    ano => `
                        <option value="${ano}">
                            ${ano}
                        </option>
                    `
                )
                .join("")
        }

    `;


    if (
        listaAnos.includes(
            valorAtual
        )
    ) {

        anoSelect.value =
            valorAtual;

    }


    renderizarCalendarioHistorico();

    atualizarBotaoFiltroData();

}

/* =========================================================
   ATUALIZAR TEXTO DO BOTÃO DO FILTRO DE DATA
========================================================= */

function atualizarTextoBotaoFiltroData() {
    console.log("atualizarTextoBotaoFiltroData() executada.");

    const botao = document.getElementById("botaoFiltroDataHistorico");

    if (!botao) {
        console.warn("Botão botaoFiltroDataHistorico não encontrado.");
        return;
    }

    const dataInicial = document.getElementById("dataInicialHistorico");
    const dataFinal = document.getElementById("dataFinalHistorico");

    const valorInicial = dataInicial ? dataInicial.value : "";
    const valorFinal = dataFinal ? dataFinal.value : "";

    if (valorInicial && valorFinal) {
        botao.textContent = `${valorInicial} - ${valorFinal}`;
    } else if (valorInicial) {
        botao.textContent = valorInicial;
    } else if (valorFinal) {
        botao.textContent = valorFinal;
    } else {
        botao.textContent = "Filtrar por data";
    }
}


/* =========================================================
   ABRIR / FECHAR CALENDÁRIO
========================================================= */

function alternarFiltroDataHistorico() {
    const painel = document.getElementById("painelFiltroDataHistorico");

    if (!painel) {
        console.error("painelFiltroDataHistorico não encontrado.");
        return;
    }

    painel.classList.toggle("aberto");

    if (painel.classList.contains("aberto")) {
        renderizarCalendarioHistorico();
        atualizarTextoBotaoFiltroData();
    }
}


/* =========================================================
   RENDERIZAR CALENDÁRIO
========================================================= */

function renderizarCalendarioHistorico() {

    const calendario =
        document.getElementById(
            "calendarioHistorico"
        );


    const titulo =
        document.getElementById(
            "mesAnoCalendarioHistorico"
        );


    if (
        !calendario ||
        !titulo
    ) {

        return;

    }


    const ano =
        calendarioDataAtual.getFullYear();


    const mes =
        calendarioDataAtual.getMonth();


    titulo.textContent =
        `${nomesMeses[mes]} de ${ano}`;


    const primeiroDia =
        new Date(
            ano,
            mes,
            1
        ).getDay();


    const ultimoDia =
        new Date(
            ano,
            mes + 1,
            0
        ).getDate();


    const hoje =
        new Date();


    let html = "";


    for (
        let i = 0;
        i < primeiroDia;
        i++
    ) {

        html += `

            <button
                type="button"
                class="dia-calendario vazio"
                disabled
            ></button>

        `;

    }


    for (
        let dia = 1;
        dia <= ultimoDia;
        dia++
    ) {

        const diaTexto =
            String(dia);


        const mesTexto =
            String(mes + 1);


        const anoTexto =
            String(ano);


        const selecionado =
            filtroDataHistorico.dia ===
                diaTexto &&
            filtroDataHistorico.mes ===
                mesTexto &&
            filtroDataHistorico.ano ===
                anoTexto;


        const ehHoje =
            hoje.getDate() === dia &&
            hoje.getMonth() === mes &&
            hoje.getFullYear() === ano;


        html += `

            <button
                type="button"
                class="dia-calendario
                    ${selecionado ? "selecionado" : ""}
                    ${ehHoje ? "hoje" : ""}
                "
                onclick="selecionarDiaCalendario(${dia})"
            >
                ${dia}
            </button>

        `;

    }


    calendario.innerHTML =
        html;


    const mesSelect =
        document.getElementById(
            "mesFiltroCalendarioHistorico"
        );


    const anoSelect =
        document.getElementById(
            "anoFiltroCalendarioHistorico"
        );


    if (mesSelect) {

        mesSelect.value =
            filtroDataHistorico.mes || "";

    }


    if (anoSelect) {

        anoSelect.value =
            filtroDataHistorico.ano || "";

    }

}


/* =========================================================
   MUDAR MÊS DO CALENDÁRIO
========================================================= */

function mudarMesCalendario(
    quantidade
) {

    calendarioDataAtual =
        new Date(
            calendarioDataAtual.getFullYear(),
            calendarioDataAtual.getMonth() +
                quantidade,
            1
        );


    renderizarCalendarioHistorico();

}


/* =========================================================
   SELECIONAR DIA
========================================================= */

function selecionarDiaCalendario(
    dia
) {

    const ano =
        calendarioDataAtual.getFullYear();


    const mes =
        calendarioDataAtual.getMonth() + 1;


    filtroDataHistorico.dia =
        String(dia);


    filtroDataHistorico.mes =
        String(mes);


    filtroDataHistorico.ano =
        String(ano);


    renderizarCalendarioHistorico();

}


/* =========================================================
   ALTERAR MÊS PELO SELECT
========================================================= */

function alterarMesCalendarioPorSelect() {

    const select =
        document.getElementById(
            "mesFiltroCalendarioHistorico"
        );


    if (!select) {

        return;

    }


    const mes =
        select.value;


    filtroDataHistorico.mes =
        mes;


    filtroDataHistorico.dia =
        "";


    if (mes) {

        calendarioDataAtual =
            new Date(
                calendarioDataAtual.getFullYear(),
                Number(mes) - 1,
                1
            );

    }


    renderizarCalendarioHistorico();

}


/* =========================================================
   ALTERAR ANO PELO SELECT
========================================================= */

function alterarAnoCalendarioPorSelect() {

    const select =
        document.getElementById(
            "anoFiltroCalendarioHistorico"
        );


    if (!select) {

        return;

    }


    const ano =
        select.value;


    filtroDataHistorico.ano =
        ano;


    filtroDataHistorico.dia =
        "";


    if (ano) {

        calendarioDataAtual =
            new Date(
                Number(ano),
                calendarioDataAtual.getMonth(),
                1
            );

    }


    renderizarCalendarioHistorico();

}


/* =========================================================
   APLICAR FILTRO DE DATA
========================================================= */

function aplicarFiltroDataHistorico() {

    const painel =
        document.getElementById(
            "painelFiltroDataHistorico"
        );


    paginaHistoricoAtual = 1;

    registrosSelecionados.clear();


    atualizarBotaoFiltroData();


    if (painel) {

        painel.classList.remove(
            "aberto"
        );

    }


    carregarHistorico(
        true
    );

}


/* =========================================================
   LIMPAR FILTRO DE DATA
========================================================= */

function limparFiltroDataHistorico() {

    filtroDataHistorico = {
        dia: "",
        mes: "",
        ano: ""
    };


    calendarioDataAtual =
        new Date();


    const painel =
        document.getElementById(
            "painelFiltroDataHistorico"
        );


    registrosSelecionados.clear();


    renderizarCalendarioHistorico();

    atualizarBotaoFiltroData();


    if (painel) {

        painel.classList.remove(
            "aberto"
        );

    }


    paginaHistoricoAtual = 1;

    carregarHistorico(
        true
    );

}


/* =========================================================
   TEXTO DO BOTÃO DO FILTRO
========================================================= */

function atualizarBotaoFiltroData() {

    const botao =
        document.getElementById(
            "btnFiltroDataHistorico"
        );


    if (!botao) {

        return;

    }


    const {
        dia,
        mes,
        ano
    } =
        filtroDataHistorico;


    if (
        dia &&
        mes &&
        ano
    ) {

        botao.textContent =
            `📅 ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;

        return;

    }


    if (
        mes &&
        ano
    ) {

        botao.textContent =
            `📅 ${nomesMeses[Number(mes) - 1]} de ${ano}`;

        return;

    }


    if (mes) {

        botao.textContent =
            `📅 ${nomesMeses[Number(mes) - 1]}`;

        return;

    }


    if (ano) {

        botao.textContent =
            `📅 Ano ${ano}`;

        return;

    }


    botao.textContent =
        "📅 Filtrar por data";

}


/* =========================================================
   APLICAR FILTROS DO HISTÓRICO
========================================================= */

function aplicarFiltrosHistorico() {

    paginaHistoricoAtual = 1;

    registrosSelecionados.clear();


    carregarHistorico(
        true
    );

}


/* =========================================================
   LIMPAR FILTROS
========================================================= */

function limparFiltrosHistorico() {

    const campo =
        document.getElementById(
            "buscaHistorico"
        );


    const status =
        document.getElementById(
            "filtroStatusHistorico"
        );


    if (campo) {

        campo.value = "";

    }


    if (status) {

        status.value = "";

    }


    filtroDataHistorico = {
        dia: "",
        mes: "",
        ano: ""
    };


    calendarioDataAtual =
        new Date();


    registrosSelecionados.clear();


    inicializarFiltroDataHistorico();


    paginaHistoricoAtual = 1;


    carregarHistorico(
        true
    );

}


/* =========================================================
   MOSTRAR TODOS
========================================================= */

function mostrarTodos() {

    limparFiltrosHistorico();

}


/* =========================================================
   PAGINAÇÃO
========================================================= */

function atualizarPaginacaoHistorico(
    totalRegistros
) {

    const tabela =
        document.getElementById(
            "tabelaHistorico"
        );


    if (!tabela) return;


    const containerTabela =
        tabela.closest(
            ".tabela-container"
        );


    if (!containerTabela) return;


    let paginacao =
        document.getElementById(
            "paginacaoHistorico"
        );


    if (!paginacao) {

        paginacao =
            document.createElement(
                "div"
            );


        paginacao.id =
            "paginacaoHistorico";


        paginacao.style.display =
            "flex";


        paginacao.style.alignItems =
            "center";


        paginacao.style.justifyContent =
            "center";


        paginacao.style.gap =
            "10px";


        paginacao.style.marginTop =
            "20px";


        containerTabela.parentNode.insertBefore(
            paginacao,
            containerTabela.nextSibling
        );

    }


    if (!totalRegistros) {

        paginacao.innerHTML = "";

        paginacao.style.display =
            "none";

        return;

    }


    const totalPaginas =
        Math.ceil(
            totalRegistros /
            REGISTROS_POR_PAGINA
        );


    if (
        totalPaginas <= 1
    ) {

        paginacao.innerHTML = "";

        paginacao.style.display =
            "none";

        return;

    }


    paginacao.style.display =
        "flex";


    paginacao.innerHTML = `

        <button
            class="btn-secundario"
            onclick="paginaHistoricoAnterior()"
            ${
                paginaHistoricoAtual <= 1
                    ? "disabled"
                    : ""
            }
        >
            Anterior
        </button>


        <span>

            Página

            <strong>
                ${paginaHistoricoAtual}
            </strong>

            de

            <strong>
                ${totalPaginas}
            </strong>

        </span>


        <button
            class="btn-secundario"
            onclick="paginaHistoricoProxima()"
            ${
                paginaHistoricoAtual >=
                totalPaginas
                    ? "disabled"
                    : ""
            }
        >
            Próxima
        </button>

    `;

}


function paginaHistoricoAnterior() {

    if (
        paginaHistoricoAtual <=
        1
    ) {

        return;

    }


    paginaHistoricoAtual--;

    carregarHistorico();

}


function paginaHistoricoProxima() {

    const totalPaginas =
        Math.ceil(
            obterQuantidadeFiltradaHistorico() /
            REGISTROS_POR_PAGINA
        );


    if (
        paginaHistoricoAtual >=
        totalPaginas
    ) {

        return;

    }


    paginaHistoricoAtual++;

    carregarHistorico();

}


/* =========================================================
   QUANTIDADE FILTRADA
========================================================= */

function obterQuantidadeFiltradaHistorico() {

    const campo =
        document.getElementById(
            "buscaHistorico"
        );


    const filtroStatus =
        document.getElementById(
            "filtroStatusHistorico"
        );


    const termo =
        normalizarTexto(
            campo
                ? campo.value
                : ""
        );


    const status =
        filtroStatus
            ? filtroStatus.value
            : "";


    return registros.filter(
        item => {

            if (termo) {

                const encontrou =

                    normalizarTexto(
                        item.lms
                    ).includes(
                        termo
                    )

                    ||

                    normalizarTexto(
                        item.nome
                    ).includes(
                        termo
                    )

                    ||

                    normalizarTexto(
                        item.codigo
                    ).includes(
                        termo
                    );


                if (!encontrou) {

                    return false;

                }

            }


            if (
                status &&
                item.status !==
                    status
            ) {

                return false;

            }


            if (
                filtroDataHistorico.dia ||
                filtroDataHistorico.mes ||
                filtroDataHistorico.ano
            ) {

                if (!item.retirada) {

                    return false;

                }


                const data =
                    new Date(
                        item.retirada
                    );


                if (
                    Number.isNaN(
                        data.getTime()
                    )
                ) {

                    return false;

                }


                const dia =
                    String(
                        data.getDate()
                    );


                const mes =
                    String(
                        data.getMonth() + 1
                    );


                const ano =
                    String(
                        data.getFullYear()
                    );


                if (
                    filtroDataHistorico.dia &&
                    dia !==
                        filtroDataHistorico.dia
                ) {

                    return false;

                }


                if (
                    filtroDataHistorico.mes &&
                    mes !==
                        filtroDataHistorico.mes
                ) {

                    return false;

                }


                if (
                    filtroDataHistorico.ano &&
                    ano !==
                        filtroDataHistorico.ano
                ) {

                    return false;

                }

            }


            return true;

        }
    ).length;

}


/* =========================================================
   SELEÇÃO INDIVIDUAL
========================================================= */

function alternarSelecaoRegistro(
    id,
    selecionado
) {

    const numeroId =
        Number(id);


    if (selecionado) {

        registrosSelecionados.add(
            numeroId
        );

    }
    else {

        registrosSelecionados.delete(
            numeroId
        );

    }


    atualizarContadorSelecionados();

    atualizarCheckboxSelecionarTodos();

}


/* =========================================================
   SELECIONAR TODOS DA PÁGINA
========================================================= */

function selecionarTodosHistorico(
    selecionado
) {

    const checkboxes =
        document.querySelectorAll(
            ".check-registro-historico"
        );


    checkboxes.forEach(
        checkbox => {

            const id =
                Number(
                    checkbox.value
                );


            checkbox.checked =
                selecionado;


            if (selecionado) {

                registrosSelecionados.add(
                    id
                );

            }
            else {

                registrosSelecionados.delete(
                    id
                );

            }

        }
    );


    atualizarContadorSelecionados();

    atualizarCheckboxSelecionarTodos();

}


/* =========================================================
   CONTROLE DE SELEÇÃO
========================================================= */

function atualizarControleSelecaoHistorico(
    listaPagina
) {

    atualizarContadorSelecionados();

    atualizarCheckboxSelecionarTodos(
        listaPagina
    );

}


function atualizarCheckboxSelecionarTodos() {

    const checkboxTodos =
        document.getElementById(
            "selecionarTodosHistorico"
        );


    if (!checkboxTodos) {

        return;

    }


    const checkboxes =
        document.querySelectorAll(
            ".check-registro-historico"
        );


    if (!checkboxes.length) {

        checkboxTodos.checked =
            false;

        checkboxTodos.indeterminate =
            false;

        return;

    }


    let selecionados =
        0;


    checkboxes.forEach(
        checkbox => {

            if (
                checkbox.checked
            ) {

                selecionados++;

            }

        }
    );


    checkboxTodos.checked =
        selecionados ===
        checkboxes.length;


    checkboxTodos.indeterminate =
        selecionados > 0 &&
        selecionados <
            checkboxes.length;

}


/* =========================================================
   CONTADOR
========================================================= */

function atualizarContadorSelecionados() {

    const contador =
        document.getElementById(
            "contadorSelecionadosHistorico"
        );


    const botao =
        document.getElementById(
            "btnExcluirSelecionados"
        );


    const quantidade =
        registrosSelecionados.size;


    if (contador) {

        contador.textContent =
            quantidade === 1
                ? "1 selecionado"
                : `${quantidade} selecionados`;

    }


    if (botao) {

        botao.disabled =
            quantidade === 0;

    }

}


/* =========================================================
   EXCLUIR SELECIONADOS
========================================================= */

async function excluirSelecionados() {

    const ids =
        Array.from(
            registrosSelecionados
        )
            .map(
                id => Number(id)
            )
            .filter(
                id =>
                    Number.isFinite(
                        id
                    )
            );


    if (!ids.length) {

        alert(
            "Selecione pelo menos um registro."
        );

        return;

    }


    const confirmar =
        confirm(
            `Tem certeza que deseja excluir ${ids.length} registro${ids.length === 1 ? "" : "s"} selecionado${ids.length === 1 ? "" : "s"}?\n\nEssa ação não poderá ser desfeita.`
        );


    if (!confirmar) {

        return;

    }


    const {
        error
    } = await db
        .from("registros")
        .delete()
        .in(
            "id",
            ids
        );


    if (error) {

        console.error(
            "Erro ao excluir registros selecionados:",
            error
        );


        alert(
            "Erro ao excluir os registros selecionados."
        );

        return;

    }


    registros =
        registros.filter(
            item =>
                !ids.includes(
                    Number(
                        item.id
                    )
                )
        );


    registrosSelecionados.clear();


    atualizarDashboard();


    const totalFiltrado =
        obterQuantidadeFiltradaHistorico();


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalFiltrado /
                REGISTROS_POR_PAGINA
            )
        );


    if (
        paginaHistoricoAtual >
        totalPaginas
    ) {

        paginaHistoricoAtual =
            totalPaginas;

    }


    await carregarHistorico();


    alert(
        `${ids.length} registro${ids.length === 1 ? "" : "s"} excluído${ids.length === 1 ? "" : "s"} com sucesso.`
    );

}


/* =========================================================
   EDITAR REGISTRO
========================================================= */

function abrirEdicao(id) {

    const registro =
        registros.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!registro) return;


    document.getElementById(
        "editarId"
    ).value =
        registro.id;


    document.getElementById(
        "editarLms"
    ).value =
        registro.lms;


    document.getElementById(
        "editarNome"
    ).value =
        registro.nome;


    document.getElementById(
        "editarCodigo"
    ).value =
        registro.codigo;


    document.getElementById(
        "editarStatus"
    ).value =
        registro.status;


    document.getElementById(
        "editarObservacao"
    ).value =
        registro.observacao || "";


    document.getElementById(
        "modalEdicao"
    ).classList.add(
        "aberto"
    );

}


/* =========================================================
   SALVAR EDIÇÃO
========================================================= */

async function salvarEdicao() {

    const id =
        Number(
            document.getElementById(
                "editarId"
            ).value
        );


    const lms =
        document.getElementById(
            "editarLms"
        ).value.trim();


    const nome =
        document.getElementById(
            "editarNome"
        ).value.trim();


    const codigo =
        document.getElementById(
            "editarCodigo"
        ).value.trim();


    const observacao =
        document.getElementById(
            "editarObservacao"
        ).value.trim();


    const novoStatus =
        document.getElementById(
            "editarStatus"
        ).value;


    if (
        !lms ||
        !nome ||
        !codigo
    ) {

        alert(
            "Preencha o LMS, nome e código do equipamento."
        );

        return;

    }


    const registro =
        registros.find(
            item =>
                Number(item.id) ===
                id
        );


    if (!registro) {

        alert(
            "Registro não encontrado."
        );

        return;

    }


    const colaborador =
        colaboradores.find(
            item =>
                normalizarTexto(
                    item.lms
                ) ===
                normalizarTexto(
                    lms
                )
        );


    if (!colaborador) {

        alert(
            "O LMS informado não está cadastrado."
        );

        return;

    }


    if (
        novoStatus ===
        "retirado"
    ) {

        const equipamentoExistente =
            registros.find(
                item =>

                    Number(item.id) !==
                    id &&

                    item.status ===
                    "retirado" &&

                    normalizarTexto(
                        item.codigo
                    ) ===
                    normalizarTexto(
                        codigo
                    )
            );


        if (
            equipamentoExistente
        ) {

            alert(
                "Este equipamento já está registrado como retirado."
            );

            return;

        }

    }


    let devolucao =
        registro.devolucao;


    if (
        novoStatus ===
        "devolvido" &&
        !devolucao
    ) {

        devolucao =
            new Date().toISOString();

    }


    if (
        novoStatus !==
        "devolvido"
    ) {

        devolucao = null;

    }


    const {
        data,
        error
    } = await db
        .from("registros")
        .update({

            lms:
                colaborador.lms,

            nome:
                colaborador.nome,

            codigo:
                codigo,

            observacao:
                observacao || null,

            status:
                novoStatus,

            devolucao:
                devolucao

        })
        .eq(
            "id",
            id
        )
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


    const indice =
        registros.findIndex(
            item =>
                Number(item.id) ===
                id
        );


    if (
        indice !==
        -1
    ) {

        registros[
            indice
        ] = data;

    }


    fecharModal();

    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   FECHAR MODAL REGISTRO
========================================================= */

function fecharModal() {

    const modal =
        document.getElementById(
            "modalEdicao"
        );


    if (!modal) return;


    modal.classList.remove(
        "aberto"
    );

}


/* =========================================================
   EXCLUIR REGISTRO INDIVIDUAL
========================================================= */

async function excluirRegistro(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este registro?"
        );


    if (!confirmar) return;


    const {
        error
    } = await db
        .from("registros")
        .delete()
        .eq(
            "id",
            id
        );


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


    registros =
        registros.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );


    registrosSelecionados.delete(
        Number(id)
    );


    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   EDITAR COLABORADOR
========================================================= */

function abrirEdicaoColaborador(id) {

    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!colaborador) return;


    document.getElementById(
        "editarColaboradorId"
    ).value =
        colaborador.id;


    document.getElementById(
        "editarColaboradorLms"
    ).value =
        colaborador.lms;


    document.getElementById(
        "editarColaboradorNome"
    ).value =
        colaborador.nome;


    document.getElementById(
        "modalColaborador"
    ).classList.add(
        "aberto"
    );

}


/* =========================================================
   SALVAR COLABORADOR
========================================================= */

async function salvarEdicaoColaborador() {

    const id =
        Number(
            document.getElementById(
                "editarColaboradorId"
            ).value
        );


    const lms =
        document.getElementById(
            "editarColaboradorLms"
        ).value.trim();


    const nome =
        document.getElementById(
            "editarColaboradorNome"
        ).value.trim();


    if (
        !lms ||
        !nome
    ) {

        alert(
            "Preencha o LMS e o nome."
        );

        return;

    }


    const outroColaborador =
        colaboradores.find(
            item =>

                Number(item.id) !==
                id &&

                normalizarTexto(
                    item.lms
                ) ===
                normalizarTexto(
                    lms
                )
        );


    if (
        outroColaborador
    ) {

        alert(
            "Este LMS já pertence a outro colaborador."
        );

        return;

    }


    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) ===
                id
        );


    if (!colaborador) return;


    const lmsAntigo =
        colaborador.lms;


    const {
        data: colaboradorAtualizado,
        error: erroColaborador
    } = await db
        .from("colaboradores")
        .update({

            lms:
                lms,

            nome:
                nome

        })
        .eq(
            "id",
            id
        )
        .select()
        .single();


    if (erroColaborador) {

        console.error(
            "Erro ao atualizar colaborador:",
            erroColaborador
        );

        alert(
            "Erro ao atualizar o colaborador."
        );

        return;

    }


    await db
        .from("registros")
        .update({

            lms:
                lms,

            nome:
                nome

        })
        .eq(
            "lms",
            lmsAntigo
        );


    colaboradores =
        colaboradores.map(
            item => {

                if (
                    Number(item.id) ===
                    id
                ) {

                    return colaboradorAtualizado;

                }

                return item;

            }
        );


    registros =
        registros.map(
            item => {

                if (
                    item.lms ===
                    lmsAntigo
                ) {

                    return {

                        ...item,

                        lms:
                            lms,

                        nome:
                            nome

                    };

                }

                return item;

            }
        );


    fecharModalColaborador();


    await carregarColaboradores();

    await carregarHistorico();

    atualizarDashboard();

}


/* =========================================================
   FECHAR MODAL COLABORADOR
========================================================= */

function fecharModalColaborador() {

    const modal =
        document.getElementById(
            "modalColaborador"
        );


    if (!modal) return;


    modal.classList.remove(
        "aberto"
    );

}


/* =========================================================
   EXCLUIR COLABORADOR
========================================================= */

async function excluirColaborador(id) {

    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!colaborador) {

        return;

    }


    const confirmar =
        confirm(
            `Deseja excluir o colaborador ${colaborador.nome}?`
        );


    if (!confirmar) {

        return;

    }


    const {
        error
    } = await db
        .from("colaboradores")
        .delete()
        .eq(
            "id",
            id
        );


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
            item =>
                Number(item.id) !==
                Number(id)
        );


    await carregarColaboradores();

}


/* =========================================================
   STATUS
========================================================= */

function formatarStatus(
    status
) {

    const nomes = {

        retirado:
            "Retirado",

        devolvido:
            "Devolvido",

        extraviado:
            "Extraviado"

    };


    return (
        nomes[status] ||
        status
    );

}


/* =========================================================
   DATA
========================================================= */

function formatarData(
    data
) {

    if (!data) {

        return "-";

    }


    const dataConvertida =
        new Date(data);


    if (
        Number.isNaN(
            dataConvertida.getTime()
        )
    ) {

        return "-";

    }


    return dataConvertida
        .toLocaleString(
            "pt-BR",
            {

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

}


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarTexto(
    texto
) {

    return String(
        texto ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[\r\n\t]/g,
            ""
        )
        .trim()
        .toLowerCase();

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHTML(
    texto
) {

    if (
        texto === undefined ||
        texto === null
    ) {

        return "";

    }


    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   FECHAR CALENDÁRIO AO CLICAR FORA
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const painel =
            document.getElementById(
                "painelFiltroDataHistorico"
            );


        const botao =
            document.getElementById(
                "btnFiltroDataHistorico"
            );


        if (
            !painel ||
            !botao
        ) {

            return;

        }


        if (
            painel.classList.contains(
                "aberto"
            ) &&
            !painel.contains(
                event.target
            ) &&
            !botao.contains(
                event.target
            )
        ) {

            painel.classList.remove(
                "aberto"
            );

        }

    }
);


/* =========================================================
   ENTER - LEITOR 2D
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const paginaRetirada =
            document.getElementById(
                "retirada"
            );


        if (
            !paginaRetirada ||
            !paginaRetirada.classList.contains(
                "active"
            )
        ) {

            return;

        }


        const elemento =
            document.activeElement;


        if (
            elemento &&
            elemento.id ===
                "lms" &&
            event.key ===
                "Enter"
        ) {

            event.preventDefault();


            const campoNome =
                document.getElementById(
                    "nome"
                );


            const campoCodigo =
                document.getElementById(
                    "codigo"
                );


            if (
                campoNome &&
                campoNome.value.trim() !==
                    ""
            ) {

                campoCodigo.focus();

            }


            return;

        }


        if (
            elemento &&
            elemento.id ===
                "codigo" &&
            event.key ===
                "Enter"
        ) {

            event.preventDefault();

            registrarRetirada();

            return;

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Sistema de Controle de Equipamentos iniciado."
        );


        const supabaseOK =
            inicializarSupabase();


        if (!supabaseOK) {

            alert(
                "Erro: o Supabase não foi carregado. Verifique o index.html."
            );

            return;

        }


        try {

            await carregarDados();

            atualizarDashboard();

        }
        catch (error) {

            console.error(
                "Falha na inicialização:",
                error
            );

            alert(
                "Não foi possível carregar os dados do sistema."
            );

        }

    }
);


/* =========================================================
   FIM
========================================================= */
