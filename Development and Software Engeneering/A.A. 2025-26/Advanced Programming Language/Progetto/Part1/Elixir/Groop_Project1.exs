defmodule Project1 do

  #Interleave
  def interleave([], ys), do: ys
  def interleave(xs, []), do: xs
  def interleave([hx | tx], [hy | ty]), do: [hx, hy | interleave(tx, ty)]

  #Chunks
  def chunks(n, _list) when n <= 0, do: []
  def chunks(_n, []), do: []
  def chunks(n, list) do
    first_chunk = my_take(n, list)
    rest_of_list = my_drop(n, list)
    [first_chunk | chunks(n, rest_of_list)]
  end

  #Rotate
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

  #Frequencies
  def frequencies(list), do: update_freq(list, [])

  # Custom take: returns first n elements
  defp my_take(0, _list), do: []
  defp my_take(_n, []), do: []
  defp my_take(n, [h | t]), do: [h | my_take(n - 1, t)]

  # Custom drop: removes first n elements
  defp my_drop(0, list), do: list
  defp my_drop(_n, []), do: []
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


# Part 3: Cesar Cipher
defmodule Cesar do
  # 1. ENCODE
  def cesar(text, n), do: do_cesar(String.to_charlist(text), n) |> List.to_string()

  defp do_cesar([], _n), do: []
  defp do_cesar([h | t], n), do: [shift_char(h, n) | do_cesar(t, n)]

  defp shift_char(c, n) when c >= ?a and c <= ?z, do: rotate(c, n, ?a)
  defp shift_char(c, n) when c >= ?A and c <= ?Z, do: rotate(c, n, ?A)
  defp shift_char(c, _n), do: c

  defp rotate(c, n, base) do
    eff_n = Integer.mod(c - base + n, 26)
    base + eff_n
  end

  # 2. CRACK
  def crack(text) do
    best_s = find_best_shift(text, 0, 0, -1)
    cesar(text, best_s)
  end

  defp find_best_shift(_text, 26, best_s, _max), do: best_s
  defp find_best_shift(text, current_s, best_s, max) do
    count = count_e(String.to_charlist(text), current_s)
    if count > max do
      find_best_shift(text, current_s + 1, current_s, count)
    else
      find_best_shift(text, current_s + 1, best_s, max)
    end
  end

  defp count_e([], _s), do: 0
  defp count_e([h | t], s) do
    shifted_h = shift_char(h, s)
    is_e = if (shifted_h == ?e or shifted_h == ?E), do: 1, else: 0
    is_e + count_e(t, s)
  end
end
