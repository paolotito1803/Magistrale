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

  ## PART 2: Types Under the Microscope

  # 2.1:

  # Interleave
  # Nothing changes with @spec, as it's typing is not checked by the compiler
  @spec interleave2_1([elem], [elem]) :: [elem] when elem: any()
  def interleave2_1([], ys), do: ys
  def interleave2_1(xs, []), do: xs
  def interleave2_1([hx | tx], [hy | ty]), do: [hx, hy | interleave2_1(tx, ty)]

  # In fact, we can even give it a wrong type in the annotation and it won't give any error or warning
  @spec interleave2_1_wrong([elem], [elem]) :: integer() when elem: any()
  def interleave2_1_wrong([], ys), do: ys
  def interleave2_1_wrong(xs, []), do: xs
  def interleave2_1_wrong([hx | tx], [hy | ty]), do: [hx, hy | interleave2_1_wrong(tx, ty)]

  # But, the compiler does check if the function referred to by the @spec actually exists,
  #  in this case the number of arguments doesn't match, thus we get an error for an undefined function:
  #  "error: spec for undefined function interleave2_1_super_wrong/1"
  # @spec interleave2_1_super_wrong([elem]) :: integer() when elem: any()
  # def interleave2_1_super_wrong([], ys), do: ys
  # def interleave2_1_super_wrong(xs, []), do: xs
  # def interleave2_1_super_wrong([hx | tx], [hy | ty]), do: [hx, hy | interleave2_1_super_wrong(tx, ty)]

  # The same goes for the frequencies function
  @spec frequencies2_1([elem]) :: [{elem, integer()}] when elem: any()
  def frequencies2_1(list), do: update_freq2_1(list, [])

  @spec update_freq2_1([elem], [{elem, integer()}]) :: [{elem, integer()}] when elem: any()
  defp update_freq2_1([], acc), do: acc
  defp update_freq2_1([h | t], acc), do: update_freq2_1(t, increment2_1(h, acc))

  @spec increment2_1(elem, [{elem, integer()}]) :: [{elem, integer()}] when elem: any()
  defp increment2_1(item, []), do: [{item, 1}]
  defp increment2_1(item, [{k, v} | tail]) do
    if k == item, do: [{k, v + 1} | tail], else: [{k, v} | increment2_1(item, tail)]
  end


  # 2.2:

  # Call A:
  # > Project1.interleave2_1([1, 2, 3], ["a", "b", "c"])
  # gives => [1, "a", 2, "b", 3, "c"]
  # Elixir lists are heterogeneous so mixing types works fine.
  # Haskell instead rejects this at compile time as both arguments must be [a] for the
  #  same a, so given that in this case it assumed a being a string, it tried to read 1 as a string and failed:
  #  ghci: "No instance for 'Num String' arising from the literal '1'"
  # Scala does not give an error like Haskell, it instead infers the union type A = Int | String
  #  and returns List[Int | String] = List(1, a, 2, b, 3, c)
  # Union types are a scala feature where the language finds the smallest upper bound to catch all types, in this case int and string.

  # Call B:
  # > Project1.frequencies2_1([1, "hello", 1, :ok, "hello"])
  # gives => [{1, 2}, {"hello", 2}, {:ok, 1}]
  # In Elixir == works across types, so comparisons are possible and frequencies produces a it's result.
  # Haskell fails this at compile time. Lists are homogeneous, so mixing
  #  Int, String and atom (that don't even exist here, but let's assume we ignore that part) in a single list is not expressible.
  #  ghci: "Could not deduce 'Num String' arising from the literal '1'"
  # Scala does the same as in Call A, at least if we ignore and delete the atom from the call, it infers A = Int | String and runs,
  #  returning List[(Int | String, Int)] = List((1,2), (hello,2))

  # Call C:
  # > Project1.chunks(0, [1, 2, 3])
  # gives (Elixir) => []
  # > chunks 0 [1, 2, 3]
  # gives (Haskell) => []
  # Both return [] as both implementations have a guard (when n <= 0 in Elixir, | n <= 0 in Haskell).
  # Scala, same as the others, has a guard to handle it and returns List() = Nil.
  # This is not a type error anyway, but an edge case that we had accounted for.
  # Without the guard, there might be some kind of logic bug like infinite loops or others, depending on implementation.


  ## PART 3 -- CAESER CIPHER
  # Private Functions -- Reimplementations and parameter swappign
  defp my_map(_f, []), do: []
  defp my_map(f, [h|t]), do: [f.(h)|my_map(f, t)]

  defp my_map_swap(xs, f), do: my_map(f,xs)

  defp my_head([h|_t]), do: h

  defp my_fst({a,_b}), do: a

  defp my_filter(_f, []), do: []
  defp my_filter(f, [h|t]) do
    if f.(h) do
      [h|my_filter(f,t)]
    else
      my_filter(f,t)
    end
  end

  defp my_filter_swap(xs,f), do: my_filter(f, xs)

  defp my_max({x,_x2}, []), do: x
  defp my_max({x,x2}, [{y,y2}|yt]) do
    if x2 < y2 do
      my_max({y,y2},yt)
    else
      my_max({x,x2},yt)
    end
  end

  defp my_to_list(f..l//s) do
    if f <= l do
      [f|my_to_list((f+s)..l//s)]
    else
      []
    end
  end

  # Private functions -- Helpers

  def shiftn(n, b) when b >= ?a and b <= ?z, do: rotate((b+n-?a),my_to_list(?a..?z)) |> my_head

  defp check_alpha(""), do: false
  defp check_alpha(c), do: c in ?a..?z or c in ?A..?Z

  defp maxFreq([h|t]), do: my_max(h,t)

  # Public functions

  # Unfortunately, we do need to specify size and coerce h because otherwise
  # Elixir will complain about not knowing the size in memory of the pattern matching
  def encode(_n, ""), do: []
  def encode(n,<<h::8>><>t) when (h >= ?a and h <= ?z) or (h >= ?A and h <= ?Z), do: [shiftn(my_mod(n, 26),h)|encode(n,t)]
  def encode(n,<<h::8>><>t), do: [h|encode(n,t)]

  def decode(n,s), do: encode(-n,s)

  def crackCipher(""), do: 0
  def crackCipher(s), do: my_map(&({&1, decode(&1,s)}), my_to_list(0..25))
                       |> my_map_swap(fn {a,b} -> {a, my_filter(&check_alpha/1, b)} end)
                       |> my_map_swap(fn {a,b} -> {a, frequencies(b)} end)
                       |> my_map_swap(fn {a,b} -> {a, maxFreq(b)} end)
                       |> my_filter_swap(fn {_a,b} -> b == ?e or b == ?E end)
                       |> my_head
                       |> my_fst
end
