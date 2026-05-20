defmacro fib do
  def fib(n) do
    if n == 0 do 0 end
    if n == 1 do 1 end
    fib(n - 1) + fib(n - 2)
  end
  def fast_fib(n) do
    fast_fib_helper(n, 0, 1)
  end

  # Clausola 1: Se n è esattamente 0, ci fermiamo e restituiamo l'accumulatore 'a'
defp fast_fib_helper(0, a, _b), do: a

# Clausola 2: Se n è un numero generico, andiamo avanti con la ricorsione
defp fast_fib_helper(n, a, b) do
  fast_fib_helper(n - 1, b, a + b)
end
end
