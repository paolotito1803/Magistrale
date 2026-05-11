# Elixir brilla quando si tratta di gestire molti compiti contemporaneamente grazie al Modello ad Attori.
# Obiettivo: Creare un piccolo sistema dove diversi processi si inviano messaggi l'un l'altro.
# Cosa impari: Processi (spawn), invio di messaggi (send/receive) e la pipeline operator (|>)

defmodule Progettino do
  def start do
    process1 = spawn(fn -> loop("Processo 1") end)
    process2 = spawn(fn -> loop("Processo 2") end)
    send(process1, {:msg, "Ciao da Processo 2!"})
    send(process2, {:msg, "Ciao da Processo 1!"})
  end
  defp loop(name) do
    receive do
      {msg, contenuto} ->
        IO.puts("#{name} ha ricevuto: #{contenuto}")
        loop(name) # Continua a ricevere messaggi
    end

  end

  def start2 do
  # Creiamo il processo 2 e lo passiamo direttamente come mittente del primo messaggio
  p2 = spawn(fn -> loop("Processo 2") end)

  # Catena: Crea p1 e inviagli subito il messaggio
  "Processo 1"
  |> spawn_loop()
  |> send({:msg, p2, "Ciao da Processo 2!"})

  Process.sleep(5000)
end

# Funzione di supporto per rendere il pipe più pulito
defp spawn_loop(name), do: spawn(fn -> loop(name) end)
end
