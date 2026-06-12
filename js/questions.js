// ============================================================
// questions.js — Banco de preguntas organizadas por nivel
// Tipos: 'fill' (completar) y 'write' (escribir completo)
// ============================================================

const QUESTIONS = [

    // ============================================================
    // NIVEL 1 — Variables y Tipos (8 preguntas)
    // ============================================================
    {
        id: 1,
        level: 1,
        type: 'fill',
        title: 'Hola Mundo',
        description: 'Completá el código para que muestre "Hola, Mundo" en pantalla. Reemplazá ___ por el texto que falta.',
        code: `nombre = "Mundo"
print(f"Hola, {___}")`,
        tests: [{ expectedOutput: 'Hola, Mundo' }],
        hint: 'Dentro de las llaves {} tenés que poner el nombre de la variable que contiene "Mundo".',
        xp: 10,
    },
    {
        id: 2,
        level: 1,
        type: 'fill',
        title: 'Edad',
        description: 'Completá asignando el número 25 a la variable edad.',
        code: `edad = ___
print(f"Tengo {edad} años")`,
        tests: [{ expectedOutput: 'Tengo 25 años' }],
        hint: 'Asignale el valor numérico 25.',
        xp: 10,
    },
    {
        id: 3,
        level: 1,
        type: 'fill',
        title: 'Operación aritmética',
        description: 'Completá la operación para que el resultado sea 16.',
        code: `resultado = (5 + 3) * ___
print(resultado)`,
        tests: [{ expectedOutput: '16' }],
        hint: '¿Qué número multiplicado por 8 da 16?',
        xp: 10,
    },
    {
        id: 4,
        level: 1,
        type: 'write',
        title: 'Mi primera variable',
        description: 'Creá una variable llamada "lenguaje" con el valor "Python" y mostrala con print().',
        code: '# Escribí tu código acá\n',
        tests: [{ expectedOutput: 'Python' }],
        hint: `Usá:\nlenguaje = "Python"\nprint(lenguaje)`,
        xp: 15,
    },
    {
        id: 5,
        level: 1,
        type: 'fill',
        title: 'Sumando variables',
        description: 'Completá para que el código sume dos variables correctamente.',
        code: `a = 10
b = 20
suma = a + ___
print(suma)`,
        tests: [{ expectedOutput: '30' }],
        hint: '¿Qué variable contiene el 20?',
        xp: 10,
    },
    {
        id: 6,
        level: 1,
        type: 'fill',
        title: 'Tipos de datos',
        description: 'Completá para que el programa muestre el tipo de dato de un número decimal.',
        code: `print(type(___))`,
        tests: [{ expectedOutput: "<class 'float'>" }],
        hint: 'Usá un número decimal como 3.14',
        xp: 10,
    },
    {
        id: 7,
        level: 1,
        type: 'write',
        title: 'Conversión de tipos',
        description: 'Convertí el string "100" a entero, sumale 50 y mostrá el resultado.',
        code: '# Escribí tu código acá\n',
        tests: [{ expectedOutput: '150' }],
        hint: 'Usá int() para convertir el string y luego sumá.',
        xp: 15,
    },
    {
        id: 8,
        level: 1,
        type: 'fill',
        title: 'F-strings',
        description: 'Completá para que el mensaje muestre "Python 3 es genial".',
        code: `version = 3
print(f"Python {___} es genial")`,
        tests: [{ expectedOutput: 'Python 3 es genial' }],
        hint: 'Dentro de las llaves va el nombre de la variable que contiene el 3.',
        xp: 10,
    },

    // ============================================================
    // NIVEL 2 — Condicionales (8 preguntas)
    // ============================================================
    {
        id: 9,
        level: 2,
        type: 'fill',
        title: 'If básico',
        description: 'Completá para que el programa muestre "Es grande" cuando x es mayor a 5.',
        code: `x = 10
if x > 5:
    print("___")`,
        tests: [{ expectedOutput: 'Es grande' }],
        hint: 'El string que va en el print es "Es grande".',
        xp: 10,
    },
    {
        id: 10,
        level: 2,
        type: 'write',
        title: 'Número par o impar',
        description: 'Escribí un programa que tenga una variable número = 7 y muestre si es "par" o "impar".',
        code: `numero = 7
# Escribí tu código acá`,
        tests: [{ expectedOutput: 'impar' }],
        hint: 'Usá el operador % (módulo). Si numero % 2 == 0 es par.',
        xp: 20,
    },
    {
        id: 11,
        level: 2,
        type: 'fill',
        title: 'If-else',
        description: 'Completá el else para que muestre "Menor" si edad es menor a 18.',
        code: `edad = 15
if edad >= 18:
    print("Mayor")
else:
    print("___")`,
        tests: [{ expectedOutput: 'Menor' }],
        hint: 'En el print del else va "Menor".',
        xp: 10,
    },
    {
        id: 12,
        level: 2,
        type: 'write',
        title: 'Mayor de dos números',
        description: 'Escribí un programa que compare dos números a=25 y b=18, y muestre cuál es el mayor.',
        code: `a = 25
b = 18
# Escribí tu código acá`,
        tests: [{ expectedOutput: '25' }],
        hint: 'Usá un if para comparar a y b, y mostrá el mayor con print().',
        xp: 20,
    },
    {
        id: 13,
        level: 2,
        type: 'fill',
        title: 'Elif',
        description: 'Completá para clasificar una nota del 0 al 10.',
        code: `nota = 8
if nota >= 9:
    print("Sobresaliente")
___ nota >= 7:
    print("Notable")
else:
    print("Regular")`,
        tests: [{ expectedOutput: 'Notable' }],
        hint: 'La palabra clave es "elif".',
        xp: 10,
    },
    {
        id: 14,
        level: 2,
        type: 'write',
        title: 'Año bisiesto',
        description: 'Escribí un programa que determine si el año 2024 es bisiesto. Un año es bisiesto si es divisible por 4 y no por 100, o si es divisible por 400.',
        code: `anio = 2024
# Escribí tu código acá`,
        tests: [{ expectedOutput: 'Es bisiesto' }],
        hint: 'Usá el operador % y combiná condiciones con and/or.',
        xp: 20,
    },
    {
        id: 15,
        level: 2,
        type: 'fill',
        title: 'Operador and',
        description: 'Completá para que muestre "Acceso permitido" solo si usuario es "admin" y password es "1234".',
        code: `usuario = "admin"
password = "1234"
if usuario == "admin" ___ password == "1234":
    print("Acceso permitido")
else:
    print("Acceso denegado")`,
        tests: [{ expectedOutput: 'Acceso permitido' }],
        hint: 'Usá el operador "and" para combinar ambas condiciones.',
        xp: 10,
    },
    {
        id: 16,
        level: 2,
        type: 'write',
        title: 'Calculadora simple',
        description: 'Escribí un programa que tome dos números a=10, b=3 y un operador op="+" y muestre el resultado.',
        code: `a = 10
b = 3
op = "+"
# Escribí tu código acá`,
        tests: [{ expectedOutput: '13' }],
        hint: 'Usá if/elif para cada operador (+, -, *, /) y print para mostrar el resultado.',
        xp: 20,
    },

    // ============================================================
    // NIVEL 3 — Bucles (7 preguntas)
    // ============================================================
    {
        id: 17,
        level: 3,
        type: 'fill',
        title: 'For básico',
        description: 'Completá el for para que muestre los números del 0 al 4.',
        code: `for i in range(___):
    print(i)`,
        tests: [{ expectedOutput: '0\n1\n2\n3\n4' }],
        hint: 'range(5) genera números del 0 al 4.',
        xp: 10,
    },
    {
        id: 18,
        level: 3,
        type: 'write',
        title: 'Sumatoria',
        description: 'Escribí un programa que sume los números del 1 al 100 y muestre el resultado.',
        code: '# Escribí tu código acá\n',
        tests: [{ expectedOutput: '5050' }],
        hint: 'Usá un for con range(1, 101) y un acumulador.',
        xp: 20,
    },
    {
        id: 19,
        level: 3,
        type: 'fill',
        title: 'While',
        description: 'Completá el while para que cuente del 1 al 5.',
        code: `contador = 1
while contador ___ 5:
    print(contador)
    contador += 1`,
        tests: [{ expectedOutput: '1\n2\n3\n4\n5' }],
        hint: 'Usá el operador <= para que el while continúe mientras contador sea menor o igual a 5.',
        xp: 10,
    },
    {
        id: 20,
        level: 3,
        type: 'write',
        title: 'Tabla de multiplicar',
        description: 'Escribí un programa que muestre la tabla de multiplicar del 5 (del 1 al 10).',
        code: `numero = 5
# Escribí tu código acá`,
        tests: [{ expectedOutput: '5\n10\n15\n20\n25\n30\n35\n40\n45\n50' }],
        hint: 'Usá un for con range(1, 11) y mostrá numero * i.',
        xp: 20,
    },
    {
        id: 21,
        level: 3,
        type: 'fill',
        title: 'Break',
        description: 'Completá para que el bucle se detenga cuando llegue a 3.',
        code: `for i in range(1, 10):
    if i == 3:
        ___
    print(i)`,
        tests: [{ expectedOutput: '1\n2' }],
        hint: 'Usá "break" para salir del bucle.',
        xp: 10,
    },
    {
        id: 22,
        level: 3,
        type: 'write',
        title: 'Contar vocales',
        description: 'Escribí un programa que cuente cuántas vocales tiene la palabra "Python".',
        code: `palabra = "Python"
# Escribí tu código acá`,
        tests: [{ expectedOutput: '1' }],
        hint: 'Usá un for que recorra la palabra y un if para contar las vocales (a, e, i, o, u).',
        xp: 20,
    },
    {
        id: 23,
        level: 3,
        type: 'fill',
        title: 'Continue',
        description: 'Completá para que muestre solo los números impares del 1 al 5.',
        code: `for i in range(1, 6):
    if i % 2 == 0:
        ___
    print(i)`,
        tests: [{ expectedOutput: '1\n3\n5' }],
        hint: 'Usá "continue" para saltar los pares.',
        xp: 10,
    },

    // ============================================================
    // NIVEL 4 — Funciones y Listas (8 preguntas)
    // ============================================================
    {
        id: 24,
        level: 4,
        type: 'fill',
        title: 'Función simple',
        description: 'Completá la función para que muestre "Hola" cuando la llamemos.',
        code: `def saludar():
    print("___")

saludar()`,
        tests: [{ expectedOutput: 'Hola' }],
        hint: 'El print debe mostrar el string "Hola".',
        xp: 10,
    },
    {
        id: 25,
        level: 4,
        type: 'write',
        title: 'Función sumar',
        description: 'Escribí una función llamada "sumar" que reciba dos números y devuelva su suma.',
        code: `def sumar(a, b):
    # Escribí tu código acá`,
        tests: [
            { call: 'sumar(3, 4)', expectedOutput: '7' },
            { call: 'sumar(10, 20)', expectedOutput: '30' },
        ],
        hint: 'Usá return a + b',
        xp: 20,
    },
    {
        id: 26,
        level: 4,
        type: 'fill',
        title: 'Append a lista',
        description: 'Completá para agregar el número 4 a la lista.',
        code: `numeros = [1, 2, 3]
numeros.___(4)
print(numeros)`,
        tests: [{ expectedOutput: '[1, 2, 3, 4]' }],
        hint: 'El método para agregar al final de una lista es "append".',
        xp: 10,
    },
    {
        id: 27,
        level: 4,
        type: 'write',
        title: 'Función que filtra',
        description: 'Escribí una función llamada "pares" que reciba una lista y devuelva solo los números pares.',
        code: `def pares(lista):
    # Escribí tu código acá`,
        tests: [
            { call: 'pares([1, 2, 3, 4, 5, 6])', expectedOutput: '[2, 4, 6]' },
            { call: 'pares([7, 8, 9])', expectedOutput: '[8]' },
        ],
        hint: 'Usá un for con if para filtrar, o una list comprehension.',
        xp: 20,
    },
    {
        id: 28,
        level: 4,
        type: 'fill',
        title: 'Len y slicing',
        description: 'Completá para mostrar el último elemento de la lista.',
        code: `frutas = ["manzana", "banana", "cereza"]
print(frutas[___])`,
        tests: [{ expectedOutput: 'cereza' }],
        hint: 'Los índices arrancan en 0. El último índice es len(frutas) - 1, o usá -1.',
        xp: 10,
    },
    {
        id: 29,
        level: 4,
        type: 'write',
        title: 'Máximo de una lista',
        description: 'Escribí una función "maximo" que reciba una lista de números y devuelva el más grande. NO uses max().',
        code: `def maximo(lista):
    # Escribí tu código acá`,
        tests: [
            { call: 'maximo([3, 7, 2, 9, 1])', expectedOutput: '9' },
            { call: 'maximo([-5, -2, -10])', expectedOutput: '-2' },
        ],
        hint: 'Inicializá una variable con el primer elemento y compará con un for.',
        xp: 20,
    },
    {
        id: 30,
        level: 4,
        type: 'fill',
        title: 'Return',
        description: 'Completá la función para que devuelva el doble del número.',
        code: `def doble(n):
    ___ n * 2

print(doble(5))`,
        tests: [{ expectedOutput: '10' }],
        hint: 'Usá "return" para devolver el valor.',
        xp: 10,
    },
    {
        id: 31,
        level: 4,
        type: 'write',
        title: 'Contar ocurrencias',
        description: 'Escribí una función "contar" que reciba una lista y un valor, y devuelva cuántas veces aparece ese valor en la lista.',
        code: `def contar(lista, valor):
    # Escribí tu código acá`,
        tests: [
            { call: 'contar([1, 2, 3, 2, 4, 2], 2)', expectedOutput: '3' },
            { call: 'contar(["a", "b", "a"], "c")', expectedOutput: '0' },
        ],
        hint: 'Usá un contador y un for para recorrer la lista.',
        xp: 20,
    },

    // ============================================================
    // NIVEL 5 — POO y Avanzado (6 preguntas)
    // ============================================================
    {
        id: 32,
        level: 5,
        type: 'fill',
        title: 'Clase básica',
        description: 'Completá para crear una clase "Perro" con un método "ladrar".',
        code: `class Perro:
    def ladrar(___):
        print("Guau!")

mi_perro = Perro()
mi_perro.ladrar()`,
        tests: [{ expectedOutput: 'Guau!' }],
        hint: 'Los métodos de instancia reciben "self" como primer parámetro.',
        xp: 10,
    },
    {
        id: 33,
        level: 5,
        type: 'write',
        title: 'Constructor',
        description: 'Creá una clase "Persona" con constructor que reciba nombre y edad, y un método "saludar" que muestre "Hola, soy [nombre]".',
        code: `class Persona:
    # Escribí tu código acá`,
        tests: [
            { call: 'Persona("Ana", 25).saludar()', expectedOutput: 'Hola, soy Ana' },
        ],
        hint: 'El constructor en Python es __init__(self, nombre, edad). Guardá los parámetros como atributos.',
        xp: 20,
    },
    {
        id: 34,
        level: 5,
        type: 'fill',
        title: 'Atributos de instancia',
        description: 'Completá para que el método __init__ guarde el nombre correctamente.',
        code: `class Gato:
    def __init__(self, nombre):
        self.___ = nombre
    
    def maullar(self):
        print(f"{self.nombre} dice Miau!")

gato = Gato("Bigotes")
gato.maullar()`,
        tests: [{ expectedOutput: 'Bigotes dice Miau!' }],
        hint: 'El atributo debe llamarse "nombre" para que el método maullar funcione.',
        xp: 10,
    },
    {
        id: 35,
        level: 5,
        type: 'write',
        title: 'Herencia',
        description: 'Creá una clase "Animal" con método "hacer_sonido", y una clase "Perro" que herede de Animal y sobrescriba el método para mostrar "Guau!".',
        code: `class Animal:
    def hacer_sonido(self):
        print("..." )

class Perro(Animal):
    # Escribí tu código acá`,
        tests: [
            { call: 'Perro().hacer_sonido()', expectedOutput: 'Guau!' },
        ],
        hint: 'La clase Perro hereda de Animal. Sobrescribí el método hacer_sonido.',
        xp: 20,
    },
    {
        id: 36,
        level: 5,
        type: 'fill',
        title: 'Try-Except',
        description: 'Completá el bloque try/except para manejar la división por cero.',
        code: `try:
    resultado = 10 / ___
    print(resultado)
except ZeroDivisionError:
    print("Error: división por cero")`,
        tests: [{ expectedOutput: 'Error: división por cero' }],
        hint: '¿Qué valor hace que 10 / x sea una división por cero?',
        xp: 10,
    },
    {
        id: 37,
        level: 5,
        type: 'write',
        title: '__str__',
        description: 'Agregá el método __str__ a la clase Libro para que devuelva "Título: [titulo] de [autor]".',
        code: `class Libro:
    def __init__(self, titulo, autor):
        self.titulo = titulo
        self.autor = autor
    
    # Escribí el método __str__ acá`,
        tests: [
            { call: 'str(Libro("1984", "George Orwell"))', expectedOutput: 'Título: 1984 de George Orwell' },
        ],
        hint: '__str__ debe devolver (con return) un string formateado.',
        xp: 20,
    },
];
