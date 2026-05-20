defmodule MyList do
    def countdown(n) do
      if n == 0 do [] end
      [n | countdown(n-1)]
    end
end
