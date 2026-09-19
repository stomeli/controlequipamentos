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

        console.log(
            "Iniciando carregamento dos dados..."
        );


        /* =================================================
           REGISTROS
        ================================================= */

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


        /* =================================================
           COLABORADORES
        ================================================= */

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


        /* =================================================
           SALVAR DADOS
        ================================================= */

        registros =
            dadosRegistros || [];

        colaboradores =
            dadosColaboradores || [];


        console.log(
            "Registros carregados:",
            registros.length
        );

        console.log(
            "Colaboradores carregados:",
            colaboradores.length
        );


        atualizarDashboard();

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

        carregarHistorico();

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


    const lms =
        normalizarTexto(
            campoLms.value
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
            item =>
                normalizarTexto(
                    item.lms
                ) ===
                lms
        );


    if (colaborador) {

        campoNome.value =
            colaborador.nome;

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


    const nomeColaborador =
        colaborador.nome;


    /* =================================================
       VERIFICAR EQUIPAMENTO JÁ RETIRADO
    ================================================= */

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


    /* =================================================
       SALVAR NO SUPABASE
    ================================================= */

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
                    nomeColaborador,

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


    console.log(
        "Registro salvo:",
        data
    );


    /* =================================================
       ATUALIZAR ARRAY LOCAL
    ================================================= */

    const indiceExistente =
        registros.findIndex(
            item =>
                Number(item.id) ===
                Number(data.id)
        );


    if (
        indiceExistente ===
        -1
    ) {

        registros.push(
            data
        );

    }
    else {

        registros[
            indiceExistente
        ] = data;

    }


    atualizarDashboard();


    paginaHistoricoAtual = 1;

    await carregarHistorico();


    /* =================================================
       LIMPAR FORMULÁRIO
    ================================================= */

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


    /* =================================================
       MENSAGEM DE SUCESSO
    ================================================= */

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
   SOMENTE STATUS "RETIRADO"
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

async function carregarHistorico() {

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


    const termo =
        normalizarTexto(
            campo.value
        );


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
        registros;


    if (termo) {

        lista =
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

    }


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;


        atualizarPaginacaoHistorico(
            0
        );

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
                item => `

                <tr>

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
                            onclick="abrirEdicao(${Number(
                                item.id
                            )})"
                        >
                            Editar
                        </button>

                        <button
                            class="btn-excluir"
                            onclick="excluirRegistro(${Number(
                                item.id
                            )})"
                        >
                            Excluir
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");


    atualizarPaginacaoHistorico(
        listaOrdenada.length
    );

}


/* =========================================================
   PAGINAÇÃO DO HISTÓRICO
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


/* =========================================================
   PÁGINA ANTERIOR
========================================================= */

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


/* =========================================================
   PRÓXIMA PÁGINA
========================================================= */

function paginaHistoricoProxima() {

    paginaHistoricoAtual++;

    carregarHistorico();

}


/* =========================================================
   MOSTRAR TODOS
========================================================= */

function mostrarTodos() {

    const campo =
        document.getElementById(
            "buscaHistorico"
        );


    if (!campo) return;


    campo.value = "";

    paginaHistoricoAtual = 1;

    carregarHistorico();

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


    const editarId =
        document.getElementById(
            "editarId"
        );

    const editarLms =
        document.getElementById(
            "editarLms"
        );

    const editarNome =
        document.getElementById(
            "editarNome"
        );

    const editarCodigo =
        document.getElementById(
            "editarCodigo"
        );

    const editarStatus =
        document.getElementById(
            "editarStatus"
        );

    const editarObservacao =
        document.getElementById(
            "editarObservacao"
        );

    const modal =
        document.getElementById(
            "modalEdicao"
        );


    if (
        !editarId ||
        !editarLms ||
        !editarNome ||
        !editarCodigo ||
        !editarStatus ||
        !editarObservacao ||
        !modal
    ) {

        return;

    }


    editarId.value =
        registro.id;

    editarLms.value =
        registro.lms;

    editarNome.value =
        registro.nome;

    editarCodigo.value =
        registro.codigo;

    editarStatus.value =
        registro.status;

    editarObservacao.value =
        registro.observacao ||
        "";


    modal.classList.add(
        "aberto"
    );

}


/* =========================================================
   SALVAR EDIÇÃO DO REGISTRO
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
                "Erro ao salvar as alterações."
            );

        }

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
   FECHAR MODAL DE REGISTRO
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
   EXCLUIR REGISTRO
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


    const campoId =
        document.getElementById(
            "editarColaboradorId"
        );

    const campoLms =
        document.getElementById(
            "editarColaboradorLms"
        );

    const campoNome =
        document.getElementById(
            "editarColaboradorNome"
        );

    const modal =
        document.getElementById(
            "modalColaborador"
        );


    if (
        !campoId ||
        !campoLms ||
        !campoNome ||
        !modal
    ) {

        return;

    }


    campoId.value =
        colaborador.id;

    campoLms.value =
        colaborador.lms;

    campoNome.value =
        colaborador.nome;


    modal.classList.add(
        "aberto"
    );

}


/* =========================================================
   SALVAR EDIÇÃO DO COLABORADOR
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


    const {
        error: erroRegistros
    } = await db
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
   FECHAR MODAL DE COLABORADOR
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
   FORMATAÇÃO DE STATUS
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
   FORMATAÇÃO DE DATA
========================================================= */

function formatarData(
    data
) {

    if (!data) {

        return "-";

    }


    return new Date(data)
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
   NORMALIZAÇÃO DE TEXTO
========================================================= */

function normalizarTexto(
    texto
) {

    if (
        texto === undefined ||
        texto === null
    ) {

        return "";

    }


    return String(texto)
        .trim()
        .toLowerCase();

}


/* =========================================================
   SEGURANÇA BÁSICA
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


        /* =================================================
           ENTER NO LMS
        ================================================= */

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


        /* =================================================
           ENTER NO CÓDIGO
        ================================================= */

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
   INICIALIZAÇÃO DO SISTEMA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Sistema de Controle de Equipamentos iniciado."
        );


        /* =================================================
           VERIFICAR SUPABASE
        ================================================= */

        const supabaseOK =
            inicializarSupabase();


        if (!supabaseOK) {

            alert(
                "Erro: o Supabase não foi carregado. Verifique o index.html."
            );

            return;

        }


        /* =================================================
           CARREGAR DADOS
        ================================================= */

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
   FIM DO SCRIPT
========================================================= */
