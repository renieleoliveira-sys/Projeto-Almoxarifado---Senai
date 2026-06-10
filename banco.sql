CREATE DATABASE almoxerifado;

USE almoxarifado;

CREATE TABLE usuarios(

    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    senha VARCHAR(255) NOT NULL,

    perfil ENUM(
        'ADMIN',
        'OPERADOR'
    ) NOT NULL

);

CREATE TABLE produtos(

    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    quantidade INT DEFAULT 0,

    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE movimentacoes(

    id INT AUTO_INCREMENT PRIMARY KEY,

    produto_id INT NOT NULL,

    usuario_id INT NOT NULL,

    tipo ENUM(
        'ENTRADA',
        'SAIDA'
    ) NOT NULL,

    quantidade INT NOT NULL,

    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id)
    REFERENCES produtos(id),

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)

);