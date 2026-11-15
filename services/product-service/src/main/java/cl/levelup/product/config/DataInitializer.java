package cl.levelup.product.config;

import cl.levelup.product.model.Product;
import cl.levelup.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initProducts(ProductRepository products) {
        return args -> {
            if (products.count() == 0) {
                products.saveAll(List.of(
                        p("Catan", "Juegos de mesa", 29990, "🎲", "ASSETS/Productos/catan.jpg", "Juego de estrategia y aventura para disfrutar con amigos."),
                        p("Carcassonne", "Juegos de mesa", 24990, "🏰", "ASSETS/Productos/CASCARSONNE.png", "Juego de mesa de estrategia basado en la construcción de territorios."),
                        p("XBOX Controller", "Accesorios", 59990, "🎮", null, "Controlador para disfrutar tus juegos favoritos con comodidad."),
                        p("Corsair HS80 Wireless", "Accesorios", 79990, "🎧", "ASSETS/Productos/HS80 Corsair.png", "Audífonos gamer con sonido envolvente y micrófono integrado."),
                        p("PlayStation 5", "Consolas", 549990, "🎮", null, "Consola de nueva generación para disfrutar tus juegos favoritos."),
                        p("ASUS ROG G16", "Computadores Gamers", 2299990, "🖥️", "ASSETS/Productos/ASUS ROG g16.png", "Computador gamer de alto rendimiento para videojuegos."),
                        p("Silla Secretlab Titan", "Sillas Gamers", 349990, "💺", "ASSETS/Productos/SecretLAB.png", "Silla gamer diseñada para entregar comodidad durante largas sesiones."),
                        p("Logitech G PRO SUPERLIGHT 2", "Mouse", 94990, "🖱️", "ASSETS/Productos/Superligth2.png", "Mouse gamer de alta precisión para tus partidas."),
                        p("Razer Goliathus", "Mousepad", 29990, "⬛", null, "Mousepad gamer diseñado para ofrecer precisión y control."),
                        p("Poleron Gamer", "Ropa", 14990, "👕", null, "¿Quieres un polerón gamer? Este es el tuyo, disfruta de la comodidad y el estilo.")
                ));
            }
        };
    }
    private Product p(String nombre, String categoria, int precio, String emoji, String imagen, String descripcion) {
        Product prod = new Product(); prod.setNombre(nombre); prod.setCategoria(categoria); prod.setPrecio(precio);
        prod.setEmoji(emoji); prod.setImagen(imagen); prod.setDescripcion(descripcion); return prod;
    }
}
