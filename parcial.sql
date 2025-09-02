-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100) UNIQUE,
  contraseña TEXT,
  rol VARCHAR(50)
);

-- Tabla de clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100),
  telefono VARCHAR(20)
);

-- Tabla de productos o servicios
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  precio NUMERIC(10,2),
  stock INT
);

-- Tabla de pedidos
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(10,2)
);

-- Tabla de devoluciones
CREATE TABLE devoluciones (
  id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(id),
  producto_id INT REFERENCES productos(id),
  cantidad INT,
  motivo TEXT
);



-- Rol administrador
CREATE ROLE admin LOGIN PASSWORD 'admin123';
ALTER ROLE admin WITH SUPERUSER;

-- Rol empleados
CREATE ROLE empleado LOGIN PASSWORD 'empleado123';
GRANT DELETE, UPDATE ON ALL TABLES IN SCHEMA public TO empleado;

-- Rol clientes
CREATE ROLE cliente LOGIN PASSWORD 'cliente123';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cliente;

-- Registrar pedido--

CREATE OR REPLACE PROCEDURE registrar_pedido(
  p_cliente_id INT,
  p_total NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO pedidos (cliente_id, total) VALUES (p_cliente_id, p_total);
END;
$$;

-- ventas totales--
CREATE OR REPLACE FUNCTION ventas_totales()
RETURNS NUMERIC AS $$
  SELECT SUM(total) FROM pedidos;
$$ LANGUAGE sql;

-- actualizar stock -- 

CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock = stock - NEW.cantidad
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON devoluciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();







