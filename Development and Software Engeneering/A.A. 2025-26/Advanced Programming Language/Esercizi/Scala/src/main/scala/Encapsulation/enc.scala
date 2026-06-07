object Wallets:
    opaque type Wallet = (List[Money], List[Money], Int)
    opaque type Money = (Int, Int)

    def empty: Wallet = (List.empty, List.empty, 0)

    def mint(w: Wallet, amount: Int): (Wallet, Money) = {
        val (s, u, n) = w
        val m: Money = (n, amount)
        val w2: Wallet = (s, m :: u, n + 1)
        (w2, m)
    }

    def spend(w: Wallet, m: Money): Either[String, (Wallet, Int)] = {
        val (s, u, n) = w
        val (id, amount) = m
        u.find(_._1 == id) match
            case Some(found) => 
                val u2 = u.filterNot(_._1 == id)
                Right((found :: s, u2, n), u2.map(_._2).sum)
            case None => 
                if s.exists(_._1 == id) then Left "Already spend"
                else Left "Not found"

        def verify(w: Wallet, w: Money): Boolean = {
            val (s, u, n) = w
            u.exists(_._1 == m._1)
        }
        
    }