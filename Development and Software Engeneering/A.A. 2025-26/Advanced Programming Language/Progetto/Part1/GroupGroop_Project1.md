# Project 1 Report
Group members:
- 897270 Bordignon Giacomo
- 895227 Titotto Paolo
- 891951 Zerbetto Federico
- 913849 Robertson Quinn

## Commentary Part 1
In Part 1 the **hardest implementation was `frequencies`**, especially in Scala, where we had to manage the accumulator and tried to ensure tail recursion, adding a layer of boilerplate requiring more explicit structure compared to the other languages. <br>
**Structurally all three implementations are actually nearly identical**, because all three languages use the same logic for processing a list, taking a head and processing the tail. For example the `interleave` function is almost identical in all three implementations. However, some differences are present because of language limitations. For example in Haskell’s `mod` function negative values are handled naturally, while Scala and Elixir required more attention to this detail. Interesting is also in Haskell requiring the 'Eq a =>', as the type needs to be explicitly comparable, as equality isn't defined for all types, unlike Elixir and Scala, where equality is universally available. <br>
Overall, **the most natural solution is the Haskell's solution**. This due to its syntax which is built for this kind of mathematical logic and its built in lazy evaluation that allows the code to be the direct translation of the problem's defintion.

## Commentary Part 2
The **deliberate breakage**, in part 2.2, revealed the **division between static and dynamic typing paradigms**. **Elixir operates on trust**, it executes dynamically without complaining, **Haskell demands correctness**, refusing to compile unless types perfectly align, and **Scala** is a middle ground, as it **manages mixed types** through structures like union types (`Int | String`).

Haskell’s type system felt more helpful during part 2.1, **always inferring the most general type**, it even ended up revealing our functions' wider applicability, acting as a smart and helpful collaborative guide. 

In general, **Haskell never felt like an obstacle**. Provided edge cases and function signatures are respected, it performs exactly as promised. It **lacks the fluid, polymorphism of dynamic languages**, but it's upfront about this. **Scala felt far more antagonistic**, demanding explicit type guidance rather than inferring our intent, and still ending up at times working in unexpected ways.

## Commentary Part 3

First, **we decomposed the cipher into specific functions that serve one purpose each**, like letter shifting (`shiftn`), frequency extraction (`maxFreq`), and custom list operations (`map`, `filter`), with some other helpers. **Decomposition felt similar between Haskell and Elixir**, Elixir required named helpers as anonymous functions couldn't nest. However, **Scala**’s support for encapsulation and allowing definitions inside of other functions **helped create a more succinct space** for the functions.

**Lists and tuples were mostly sufficient** for this, though we would have wanted a better native string as list representations rather than a sequence. The functions and conversions from strings to characters/bytes also left a lot to be desired. Specifically, Scala's required to manually convert strings to `List` and Elixir's requirment to specify the number of bits taken from a string in pattern matching makes reading the code less intuitive.

**The absence of mutable state initially made character rotations harder**, as we couldn't just update characters in place iteratively. **However, the immutable state forced us to define a strict separation of tasks**, preventing us from accidentally writing massive multi purpose functions, resulting instead in better modular, comprehensible code.

## Conclusion

If our primary concern were correctness, **we would choose Haskell**. As we've seen in Part 2, **Elixir's dynamic nature is very flexible but does rely heavily on trust**, allowing for unexpected runtime crashes when types might misalign because of developer error. **Scala provides static typing, but also tends to silently infer larger union types** (like we saw Int | String during mixed type lists) which can accidentally mask underlying logic errors. **Haskell, instead, acts in a much more straight forward way**. **Its uncompromising type system requires correctness and refuses to compile flawed type logic, yet its powerful inference allows for clean and intuitive development**.