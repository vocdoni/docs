# Alternative projects to Vocdoni

These close alternatives that we're aware of, compared at a feature level.

- [Democrcy Earh](https://www.democracy.earth/)
- [Belenios](https://www.inria.fr/en/centre/nancy/news/e-voting-belenios-software-now-available-for-general-public-use)
- [Open Vote Network](https://github.com/stonecoldpat/anonymousvoting)
- [Agora](https://www.agora.vote/)
- [Estonia I-voting](https://www.valimised.ee/en/internet-voting/internet-voting-estonia)
- [Votem](https://votem.com/blockchain-voting/)

|                        | Vocdoni | Democracy Earth | Belenios | Agora | Estonia | Votem | Scytl |
| ---------------------- | :-----: | :-------------: | :------: | :---: | :-----: | :---: | :---: |
| Universally verifiable |   ✔️    |        ❌        |    -     |   ❌   |    ❌    |   ❌   |   ❌   |
| State attack resistant |   ✔️    |        ❌        |    ❌     |   ❌   |    ❌    |   ❌   |   ❌   |
| Soverign identity      |   ✔️    |       ✔️        |    ❌     |  ✔️   |    ❌    |   ❌   |   ❌   |
| Vote from smartphone   |   ✔️    |       ✔️        |    ❌     |  ✔️   |    ❌    |  ✔️   |   ❌   |
| No trusted parties     |   ✔️    |       ✔️        |    ❌     |  ✔️   |    ❌    |   -   |   ❌   |
| Open source            |   ✔️    |       ✔️        |    ✔️    |   ❌   |    ❌    |   ❌   |   -   |
| Nation size suport     |   ✔️    |       ✔️        |    ❌     |  ✔️   |   ✔️    |  ✔️   |  ✔️   |
| Voter IP obfuscation   |   ✔️    |        ❌        |    ❌     |   ❌   |    ❌    |   -   |   ❌   |
| No I.C.O.              |   ✔️    |        ❌        |    ✔️    |   ❌   |   ✔️    |  ✔️   |  ✔️   |
| Form agnostic *        |   ✔️    |        ❌        |    ✔️    |  ✔️   |    -    |  ✔️   |   ❌   |
| Released and proven    |    ❌    |        ❌        |    ✔️    |   ❌   |   ✔️    |   ❌   |  ✔️   |

> Let us know about similar projects, so we potentially join efforts to develop better technical solutions :)

> Please, submit a Pull Request if you find any inaccuacy with the table above

## Form agnostic* 

We understand voting as an anonymous signaling mechanism. Therefore, our technical architecture does not make assumptions about the `form` of how the outcomes of a voting process are computed and used.

Instead we understand the `forms` as a layers on top, so we can adapt the system to the requirements and rules of specific contexts.

Our first `form` is a simple _"one identity, one vote"_ tallying scheme. It is the simplest scheme and is what people are currently used to and most major governances are using.

In the future we're planning to support more complex `forms`, since we understand that real change will come from these innovations.

- [Quadrtic voting](https://en.wikipedia.org/wiki/Quadratic_voting)
- [Liquid democracy](https://en.wikipedia.org/wiki/Delegative_democracy) / [Proxy Voting](https://en.wikipedia.org/wiki/Proxy_voting)
- [Meritocratic](https://en.wikipedia.org/wiki/Meritocracy) / [Axiarchic](https://github.com/UummProject/uumm-prototype/blob/master/support/Broken%20meritocracy.md#axiarchy) governances
