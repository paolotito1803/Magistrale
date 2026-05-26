object Wallets:

    opaque type Money = (Int, Int)
    opaque type Wallet = (List[Money], List[Money], Int)

    object Wallet:
       def empty: Wallet = (List.empty, List.empty, 0)

        extension (w: Wallet)
          def mint(amount: Int): (Wallet, Money) =
            val (u, s, n) = w
            val m: Money = (n, amount)
            val w2: Wallet = (m :: u, s, n + 1)
            (w2, m)

        def spend(m: Money): Either[String, (Wallet, Int)] = 
            val (u, s, n) = w
            val (id, amount) = m 
             u.find(_._1 == id) match
                case Some(found) =>
                    val unspent2 = u.filterNot(_._1 == id)
                    Right(((unspent2, found :: spent, next), unspent2.map(_._2).sum))
                case None =>
                    if spent.exists(_._1 == id) then Left("already spent")
                    else Left("unknown token")

            if (u.find(_._1) == id) {
                val unspent2 = u.filterNot(_._1 == id)
                Right(((unspent2, found :: spent, next), unspent2.map(_._2).sum))
            }
            else  {
                if spent.exists(_._1 == id) then Left("already spent")
                else Left("unknown token")
            }

    def verify(m: Money): Boolean =
        val (u, _, _) = w
        u.exists(_._1 == m._1)

    def balance: Int = 
        val (u, _, _) = w
        u.map(_._2).sum