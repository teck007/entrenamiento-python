---
id: 63
level: 8
type: write
title: "@classmethod"
xp: 20
hint: "Un método de clase (@classmethod) recibe la clase como primer argumento (cls). Se llama desde la clase directamente."
tests:
  - call: "Circulo.desde_diametro(10)"
    expectedOutput: "78.5"
---

Crea una clase `Circulo` con un método de clase `desde_diametro` que cree un círculo a partir del diámetro y calcule el área (3.14 * radio**2).

```python
class Circulo:
    def __init__(self, radio):
        self.radio = radio
    
    def area(self):
        return 3.14 * self.radio ** 2
    
    @classmethod
    def desde_diametro(cls, diametro):
        # Escribe tu código aquí
```
