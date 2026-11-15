-- Respaldo de referencia (PostgreSQL) - Level-Up Gamer
-- Generado como esquema/datos iniciales. Para respaldo real usar:
--   pg_dump -U <usuario> -d levelup -f docs/respaldo.sql

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    precio INTEGER NOT NULL,
    emoji VARCHAR(16),
    imagen VARCHAR(500),
    descripcion VARCHAR(1000)
);

-- NOTA: la contraseña del admin debe almacenarse con BCrypt.
-- El DataInitializer la genera automáticamente. Ejemplo de inserción manual:
-- INSERT INTO users (nombre,email,password,fecha_nacimiento,role)
-- VALUES ('Administrador','admin@levelup.cl','<hash_bcrypt>', '1990-01-01','ADMIN');

INSERT INTO products (nombre, categoria, precio, emoji, imagen, descripcion) VALUES
('Catan', 'Juegos de mesa', 29990, '🎲', 'ASSETS/Productos/catan.jpg', 'Juego de estrategia y aventura para disfrutar con amigos.'),
('Carcassonne', 'Juegos de mesa', 24990, '🏰', 'ASSETS/Productos/CASCARSONNE.png', 'Juego de mesa de estrategia basado en la construcción de territorios.'),
('XBOX Controller', 'Accesorios', 59990, '🎮', NULL, 'Controlador para disfrutar tus juegos favoritos con comodidad.'),
('Corsair HS80 Wireless', 'Accesorios', 79990, '🎧', 'ASSETS/Productos/HS80 Corsair.png', 'Audífonos gamer con sonido envolvente y micrófono integrado.'),
('PlayStation 5', 'Consolas', 549990, '🎮', NULL, 'Consola de nueva generación para disfrutar tus juegos favoritos.'),
('ASUS ROG G16', 'Computadores Gamers', 2299990, '🖥️', 'ASSETS/Productos/ASUS ROG g16.png', 'Computador gamer de alto rendimiento para videojuegos.'),
('Silla Secretlab Titan', 'Sillas Gamers', 349990, '💺', 'ASSETS/Productos/SecretLAB.png', 'Silla gamer diseñada para entregar comodidad durante largas sesiones.'),
('Logitech G PRO SUPERLIGHT 2', 'Mouse', 94990, '🖱️', 'ASSETS/Productos/Superligth2.png', 'Mouse gamer de alta precisión para tus partidas.'),
('Razer Goliathus', 'Mousepad', 29990, '⬛', NULL, 'Mousepad gamer diseñado para ofrecer precisión y control.'),
('Poleron Gamer', 'Ropa', 14990, '👕', NULL, '¿Quieres un polerón gamer? Este es el tuyo, disfruta de la comodidad y el estilo.')
ON CONFLICT DO NOTHING;
