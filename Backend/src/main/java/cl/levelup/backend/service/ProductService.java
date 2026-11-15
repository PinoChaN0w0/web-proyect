package cl.levelup.backend.service;

import cl.levelup.backend.dto.ProductDtos.ProductRequest;
import cl.levelup.backend.dto.ProductDtos.ProductResponse;
import cl.levelup.backend.model.Product;
import cl.levelup.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<ProductResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public ProductResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return toResponse(repository.save(p));
    }

    public ProductResponse update(Long id, ProductRequest req) {
        Product p = getEntity(id);
        apply(p, req);
        return toResponse(repository.save(p));
    }

    public void delete(Long id) {
        Product p = getEntity(id);
        repository.delete(p);
    }

    private Product getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void apply(Product p, ProductRequest req) {
        p.setNombre(req.nombre().trim());
        p.setCategoria(req.categoria().trim());
        p.setPrecio(req.precio());
        p.setEmoji(req.emoji() == null || req.emoji().isBlank() ? "🎮" : req.emoji().trim());
        p.setImagen(req.imagen());
        p.setDescripcion(req.descripcion());
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getNombre(), p.getCategoria(), p.getPrecio(), p.getEmoji(), p.getImagen(), p.getDescripcion());
    }
}
