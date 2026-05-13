CREATE DATABASE IF NOT EXISTS blog_db;

USE blog_db;

-- =========================
-- TABLE: users
-- =========================

CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================
-- TABLE: posts
-- =========================

CREATE TABLE IF NOT EXISTS posts (
  id INT(11) NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id INT(11) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY fk_posts_user (user_id),
  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================
-- INITIAL USERS
-- =========================

INSERT INTO users (id, username, password, role, created_at) VALUES
(1, 'admin', '$2a$12$wWfv4uOJ7t8OptNVacqZeesAy0ZDCMXBjJ.wbS65dPpFjEYt1/xS.', 'admin', '2026-04-22 14:10:44'),
(7, 'joao.silva', '$2a$12$wX9u1yZl8xQJf6k5Qv5k2O7Wq8VbXJkQF3vZQZpYkYFQx0nJ9G5lG', 'user', '2026-04-22 14:54:49'),
(8, 'maria.souza', '$2a$12$wX9u1yZl8xQJf6k5Qv5k2O7Wq8VbXJkQF3vZQZpYkYFQx0nJ9G5lG', 'user', '2026-04-22 14:54:49'),
(9, 'carlos.pereira', '$2a$12$wX9u1yZl8xQJf6k5Qv5k2O7Wq8VbXJkQF3vZQZpYkYFQx0nJ9G5lG', 'user', '2026-04-22 14:54:49'),
(10, 'ana.costa', '$2a$12$wX9u1yZl8xQJf6k5Qv5k2O7Wq8VbXJkQF3vZQZpYkYFQx0nJ9G5lG', 'user', '2026-04-22 14:54:49');

-- =========================
-- INITIAL POSTS
-- =========================

INSERT INTO posts (id, title, content, user_id, created_at) VALUES
(1, 'Meu primeiro post', 'Fala galera! Esse é meu primeiro post no blog. Muito animado pra compartilhar ideias aqui!', 7, '2026-04-22 15:03:00'),
(2, 'Dicas de programação', 'Se você está começando em programação, foque em lógica antes de frameworks. Isso faz muita diferença.', 8, '2026-04-22 15:03:00'),
(3, 'Vida de estudante', 'Ser estudante de tecnologia não é fácil, mas vale a pena no final. Café ajuda muito ', 9, '2026-04-22 15:03:00'),
(4, 'React ou Angular?', 'Na minha opinião, React é mais flexível, mas Angular já vem com tudo pronto.', 10, '2026-04-22 15:03:00'),
(5, 'Teste de segurança XSS', '<script>alert(\"XSS executado!\")</script>', 7, '2026-04-22 15:03:00'),
(6, 'Imagem suspeita', '<img src=\"x\" onerror=\"alert(''XSS via imagem'')\">', 7, '2026-04-22 15:03:00'),
(7, 'Link malicioso', '<a href=\"javascript:alert(''XSS link'')\">Clique aqui</a>', 8, '2026-04-22 15:03:00'),
(8, 'Banco de dados MySQL', 'Hoje aprendi sobre relacionamentos entre tabelas e chaves estrangeiras. Muito útil!', 9, '2026-04-22 15:03:00'),
(9, 'Node.js backend', 'Express é bem simples de usar, dá pra montar uma API rápida sem complicação.', 7, '2026-04-22 15:03:00'),
(10, 'Segurança web básica', 'Nunca confie em input do usuário. Sempre valide os dados!', 7, '2026-04-22 15:03:00'),
(11, 'Experiência com XAMPP', 'Usei o XAMPP para rodar MySQL localmente e funcionou super bem para testes.', 9, '2026-04-22 15:03:00');

-- =========================
-- AUTO_INCREMENT
-- =========================

ALTER TABLE posts AUTO_INCREMENT = 21;
ALTER TABLE users AUTO_INCREMENT = 11;
