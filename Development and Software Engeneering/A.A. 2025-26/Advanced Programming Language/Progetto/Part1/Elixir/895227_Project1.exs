@fmodule Project1 do

// Interleave
def interleave(xs, ys)
def Interleave([], ys), do: ys
def Interleave(xs, []), do xs
def Interleave([hx | tx], [hy | ty]) do [hx, hy | Interleave(tx, ty)]
end

// Chunks
def chunks(n, list)
def chunks(n, _list) when n <= 0, do: []
def chunks(_n, []), do []
def chunks(n, list) do
    first_chunk = my_take(n, list)
    rest_of_list = my_drop(n, list)
    [first_chunk | chunks(n, rest_of_list)]
  end

  // Rotate
  def rotate(n, list)
  def rotate(_n, []), do: []
  def rotate(n, list) do
    len = my_length(list)
    # Handle negative rotations to match Haskell's 'mod' behavior
    eff_n = my_mod(n, len)
    
    left = my_take(eff_n, list)
    right = my_drop(eff_n, list)
    
    # Combine the parts: right part moves to the front
    my_append(right, left)
  end

  // Frequencies
  def frequencies(list)
  def frequencies(list), do: update_freq(list, [])

  # Custom take: returns first n elements
  defp my_take(0, _), do: []
  defp my_take(_, []), do: []
  defp my_take(n, [h | t]), do: [h | my_take(n - 1, t)]

  # Custom drop: removes first n elements
  defp my_drop(0, list), do: list
  defp my_drop(_, []), do: []
  defp my_drop(n, [_h | t]), do: my_drop(n - 1, t)

  # Custom length: counts elements in the list
  defp my_length([]), do: 0
  defp my_length([_h | t]), do: 1 + my_length(t)

  # Custom append: joins two lists (equivalent to right ++ left)
  defp my_append([], list2), do: list2
  defp my_append([h | t], list2), do: [h | my_append(t, list2)]

  # Custom modulo: ensures negative n results in a correct positive index
  defp my_mod(n, len) do
    r = rem(n, len)
    if r < 0, do: r + len, else: r
  end

  # Accumulator for frequencies
  defp update_freq([], acc), do: acc
  defp update_freq([h | t], acc), do: update_freq(t, increment(h, acc))

  # Updates the count of an item in the result list
  defp increment(item, []), do: [{item, 1}]
  defp increment(item, [{k, v} | tail]) do
    if k == item do
      [{k, v + 1} | tail]
    else
      [{k, v} | increment(item, tail)]
    end
  end
end
