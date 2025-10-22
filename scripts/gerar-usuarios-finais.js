const bcrypt = require('bcryptjs');

// Função para gerar hash de senha
async function gerarHash(senha) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);
        return hash;
    } catch (error) {
        console.error('Erro ao gerar hash:', error);
        return null;
    }
}

// Usuários do sistema com suas senhas
const usuarios = [
    {
        nome: 'Cristiano Santos',
        email: 'cristiano@mariaflor.com.br',
        senha: 'admin123',
        role: 'admin',
        telefone: '(71) 99999-9999',
        observacoes: 'Criador e proprietário do sistema. Acesso total a todas as funcionalidades.'
    },
    {
        nome: 'Maria Flor Santos',
        email: 'maria@mariaflor.com.br',
        senha: 'maria2024',
        role: 'gerente',
        telefone: '(71) 98888-8888',
        observacoes: 'Gerente geral do restaurante. Acesso a relatórios e configurações.'
    },
    {
        nome: 'João Silva',
        email: 'joao.chef@mariaflor.com.br',
        senha: 'chef2024',
        role: 'funcionario',
        telefone: '(71) 97777-7777',
        observacoes: 'Chef de cozinha responsável pelo cardápio e fichas técnicas dos pratos.'
    },
    {
        nome: 'Ana Paula',
        email: 'ana.garcom@mariaflor.com.br',
        senha: 'garcom2024',
        role: 'funcionario',
        telefone: '(71) 96666-6666',
        observacoes: 'Garçom senior responsável por atendimento e vendas.'
    },
    {
        nome: 'Carlos Mendes',
        email: 'carlos.caixa@mariaflor.com.br',
        senha: 'caixa2024',
        role: 'funcionario',
        telefone: '(71) 95555-5555',
        observacoes: 'Responsável por caixa, vendas e controle financeiro.'
    },
    {
        nome: 'Pedro Oliveira',
        email: 'pedro.estoque@mariaflor.com.br',
        senha: 'estoque2024',
        role: 'funcionario',
        telefone: '(71) 94444-4444',
        observacoes: 'Responsável por controle de estoque e compras.'
    },
    {
        nome: 'Juliana Costa',
        email: 'juliana.garcom@mariaflor.com.br',
        senha: 'garcom123',
        role: 'funcionario',
        telefone: '(71) 93333-3333',
        observacoes: 'Garçom junior em treinamento.'
    },
    {
        nome: 'Roberto Santos',
        email: 'roberto.ajudante@mariaflor.com.br',
        senha: 'ajudante123',
        role: 'funcionario',
        telefone: '(71) 92222-2222',
        observacoes: 'Ajudante de cozinha responsável por preparação de ingredientes.'
    },
    {
        nome: 'Teste Sistema',
        email: 'teste@mariaflor.com.br',
        senha: 'teste123',
        role: 'funcionario',
        telefone: '(71) 91111-1111',
        observacoes: 'Usuário para testes do sistema. INATIVO.',
        ativo: false
    },
    {
        nome: 'Sandra Lima',
        email: 'sandra.supervisor@mariaflor.com.br',
        senha: 'supervisor2024',
        role: 'gerente',
        telefone: '(71) 90000-0000',
        observacoes: 'Supervisora de turno com acesso a relatórios de vendas.'
    }
];

// Função principal para gerar SQL com hashes reais
async function gerarSQLUsuarios() {
    console.log('🔐 Gerando hashes de senhas e SQL para inserção de usuários...\n');
    
    let sql = `-- Script para criar usuários no banco de dados PostgreSQL
-- Sistema Bar Restaurante Maria Flor
-- Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}

-- Limpar tabela de usuários existente
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

-- Inserir usuários com senhas hasheadas
`;

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        const senhaHash = await gerarHash(usuario.senha);
        
        if (senhaHash) {
            console.log(`✅ ${usuario.nome}: ${usuario.email} / ${usuario.senha}`);
            
            sql += `
-- ${i + 1}. ${usuario.nome.toUpperCase()}
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao, 
    ultimo_login,
    telefone,
    observacoes
) VALUES (
    '${usuario.nome}',
    '${usuario.email}',
    '${senhaHash}',
    '${usuario.role}',
    ${usuario.ativo !== false ? 'true' : 'false'},
    NOW(),
    ${usuario.ativo !== false ? 'NOW()' : 'NULL'},
    '${usuario.telefone}',
    '${usuario.observacoes}'
);
`;
        } else {
            console.error(`❌ Erro ao gerar hash para ${usuario.nome}`);
        }
    }

    sql += `
-- Exibir resumo dos usuários criados
SELECT 
    id,
    nome,
    email,
    role,
    CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status,
    telefone,
    data_criacao
FROM usuarios 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'gerente' THEN 2 
        WHEN 'funcionario' THEN 3 
        ELSE 4 
    END,
    nome;

-- Informações de acesso para os usuários
SELECT '=== CREDENCIAIS DE ACESSO ===' as info;
`;

    usuarios.forEach(usuario => {
        const status = usuario.ativo === false ? ' (INATIVO)' : '';
        sql += `SELECT '${usuario.role.toUpperCase()}: ${usuario.email} / ${usuario.senha}${status}' as credencial;\n`;
    });

    console.log('\n📄 Arquivo SQL gerado com sucesso!');
    console.log('\n🎯 RESUMO DOS USUÁRIOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    usuarios.forEach((usuario, index) => {
        const status = usuario.ativo === false ? '🔴 INATIVO' : '🟢 ATIVO';
        console.log(`${index + 1}. ${usuario.nome} (${usuario.role}) ${status}`);
        console.log(`   📧 ${usuario.email} | 🔑 ${usuario.senha}`);
        console.log(`   📞 ${usuario.telefone}`);
        console.log('');
    });

    return sql;
}

// Executar e salvar arquivo
gerarSQLUsuarios()
    .then(sql => {
        const fs = require('fs');
        fs.writeFileSync('database/usuarios_hasheados_reais.sql', sql);
        console.log('💾 Arquivo salvo: database/usuarios_hasheados_reais.sql');
        console.log('\n🚀 Para aplicar no banco de dados:');
        console.log('1. Conecte-se ao seu banco PostgreSQL');
        console.log('2. Execute o arquivo: usuarios_hasheados_reais.sql');
        console.log('3. Os usuários estarão prontos para login!');
    })
    .catch(error => {
        console.error('❌ Erro:', error);
    });

module.exports = { gerarHash, usuarios };