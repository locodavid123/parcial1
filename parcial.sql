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
  telefono VARCHAR(20),
  -- CORREGIDO: Añadir la referencia al usuario para vincular clientes con cuentas de usuario.
  usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de productos o servicios
-- CORREGIDO: Se estandarizan los nombres y se añade la columna imageUrl.
CREATE TABLE productos (
  id SERIAL PRIMARY KEY, -- Renombrado de product_id a id para consistencia
  nombre VARCHAR(100), -- Renombrado de product_name a nombre
  descripcion TEXT, -- Nuevo campo
  precio NUMERIC(10,2), -- Renombrado de unit_price a precio
  stock INT, -- Nuevo campo
  imageUrl VARCHAR(255) -- Añadido para la URL de la imagen
);

-- Tabla de pedidos
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'Pendiente' -- NUEVO: Para rastrear el estado del pedido
);

-- NUEVA TABLA: Detalle de Pedidos
-- Esta tabla es crucial para saber qué productos y en qué cantidad van en cada pedido.
CREATE TABLE pedidos_detalle (
  id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(id),
  producto_id INT REFERENCES productos(id),
  cantidad INT,
  precio_unitario NUMERIC(10,2)
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

-- CORREGIDO: actualizar stock al VENDER --
-- Esta función ahora se activa cuando se inserta un detalle de pedido (una venta) y RESTA del stock.
CREATE OR REPLACE FUNCTION actualizar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock = stock - NEW.cantidad
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NUEVO TRIGGER: para descontar stock en una venta
CREATE TRIGGER trg_actualizar_stock_venta
AFTER INSERT ON pedidos_detalle
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_venta();

-- CORREGIDO: actualizar stock al DEVOLVER --
-- Esta función ahora AUMENTA el stock cuando hay una devolución.
CREATE OR REPLACE FUNCTION actualizar_stock_devolucion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock = stock + NEW.cantidad
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CORREGIDO: El trigger ahora llama a la función correcta para devoluciones.
CREATE TRIGGER trg_actualizar_stock_devolucion
AFTER INSERT ON devoluciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_devolucion();
