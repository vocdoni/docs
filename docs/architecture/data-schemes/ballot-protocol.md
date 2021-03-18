# Ballot Protocol

The Vocdoni ballot protocol aims to be a very simple specification for the ballots and results representation. However, the interpretation of the results is not defined by the protocol.

A ***voting process*** is made out of one or more ***fields*** to be selected by eligible voters on the basis of pre-defined ***answers***. The allowed number of answers, type of answer, etc. depends on the specific ***type of process***. An eligible voter expresses her choices casting a ***ballot***.

Ballots are represented as an array of natural numbers. Each position on the array is named "field" and corresponds to one of the items to be chosen.

A field does not necessarily correspond to a question. In certain types of votes (i.e. multi select), there is only one question and fields apply to each underlying option.

Results are accumulated in a two dimension array of natural numbers (matrix). Each row references a ballot field.
 

![https://gitlab.com/p4u/drawio/-/raw/master/ballot-protocol.png?inline=false](https://gitlab.com/p4u/drawio/-/raw/master/ballot-protocol.png?inline=false)

The protocol is composed by a set of numeric and boolean variables that restrict the format of the ballot. They are defined in the [Process Parameters](/architecture/smart-contracts/process?id=contract-structs).

- `uint8 maxCount`
How many choices can be made for each ballot: 1 <= maxCount <= 100
- `uint8 maxValue`
<!-- - `**uint8 minValue` NEW PROPOSAL** -->
Determines the acceptable field value range.
- `bool uniqueValue`
Choices for a question cannot appear twice or more
- `uint16 maxTotalCost`
Limits up to how much cost, the fields of a ballot can add up to (if applicable).
0 => No limit / Not applicable
<!-- - `uint16 minTotalCost` **NEW PROPOSAL** Specify the minimum cost, the values of a ballot must add up to (if applicable). -->
<!-- 0 => No limit / Not applicable -->
- `uint16 costExponent`
The exponent that will be used to compute the "cost" of the field values.
  - `totalCost = Σ (value[i] ^ costExponent) <= maxTotalCost`
  - `costExponent` is represented as `exp * 10000` so:
    - 0 => 0.0000
    - 10000 => 1.0000
    - 65535 => 6.5535

![https://gitlab.com/p4u/drawio/-/raw/master/ballot-variables.png?inline=false](https://gitlab.com/p4u/drawio/-/raw/master/ballot-variables.png?inline=false)

---

## Results and example

The result is represented as a matrix of natural numbers. Let's take this JSON example:

```json
[ 
  [1,2,3], // in field 1: value 0 got 1 vote, value 1 got 2, value 2 got 3
  [1,4,2], // in field 2: value 0 got 1 vote, value 1 got 4, value 2 got 2
  [0,1,0]  // in field 3: value 0 got 0 vote, value 1 got 1, value 2 got 0
]
```

Each row of the matrix represents a field, there are three fields:
`[ [First field], [Second field], [Third field] ]`

The ballot protocol does not cover interpretation. However, a very common interpretation would be to consider each field as the multiplier (weight) equals to its position.

- First question [1,2,3] = `0*1 + 1*2 + 2*3` = `0 + 2 + 6` = 8
- Second question [0,4,2] = `0*0 + 1*4 + 2*2` = 8
- Third question [5,1,0] = `0*5 + 1*1 + 2*0` = 1

6 votes have been casted.

### Example

Lets see an example with `maxCount=3` and `maxValue=5` 

The human-friendly question would be: *Rate these 3 candidates to the best rock music player of the 20th century, from 0 to 5 stars.*

- Lennon is the candidate 0, so question 0
- Hendrix is the candidate 1, so question 1
- Joplin is the candidate 2, so question 2

Let's start, currently there are no votes casted:

**Results:** Lennon:[0,0,0] Hendrix:[0,0,0] Joplin:[0,0,0]

New vote [2,1,2] =>

- give 2 points to candidate 0
- give 1 point to candidate 1
- give 2 points to candidate 2

**Results:** Lennon:[0,0,1] Hendrix:[0,1,0] Joplin:[0,0,1]

- candidate 0 = 2 points (1·2)
- candidate 1 = 1 point (1·1)
- candidate 2 = 2 points (1·2)

New vote [0,1,2] =>

- give 0 points to candidate 0
- give 1 point to candidate 1
- give 2 points to candidate 2

**Results:** Lennon:[1,0,1] Hendrix:[0,2,0] Joplin:[0,0,2]

- candidate 0 = 2 points
- candidate 1 = 2 point
- candidate 2 = 4 points

New vote [0,0,0] =>

- give 0 points to candidate 0
- give 0 points to candidate 1
- give 0 points to candidate 2

**Results:** Lennon:[2,0,1] Hendrix:[1,2,0] Joplin:[1,0,2]

- candidate 0 = 2 points
- candidate 1 = 2 point
- candidate 2 = 4 points

**Final Results:** `[ [2,0,1], [1,2,0], [1,0,2] ]`

- Lennon got `2*0 + 1*0 + 2*1` = 2 points
- Hendrix got `0*1 + 1*2 + 2*0` = 2 points
- Joplin got `0*1 + 1*0 + 2*2` = 4 points
- Participation is 3 votes: `[2+0+1] || [1+2+0] || [1+0+2]`

---

## More Examples

### Rate a product

Give a value from 0-5 to a product

- Vote Envelopes: `[3]` `[5]` `[3]`
- Results: [ [0,0,2,0,0,1] ]

Two users have given 2 stars
One user have given 5 stars

**Parameters**

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 1  | 5  | -  | -  | No  |

### Rate 3 candidates

Lennon, Hendrix, Joplin ⇒ 0, 1, 2

- Vote Envelope: `[2,1,2]` `[0,1,2]` `[0,0,0]`
- Results: `[ [2,0,1], [1,2,0], [1,0,2] ]`

Lenon got `2*0 + 0*1 + 1*2` = 2 points
Hendrix got `1*0 + 2*1 + 0*2` = 2 points
Joplin got `1*0 + 0*1 + 2*2` = 4 points

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 3  | 2  | -  | -  | Yes  |

### Single choice

How do you feel today? Choose 1 out of 3 possible options: Bad, Good, Amazing

- Vote Envelopes: `[0,1,0]` `[0,1,0]` `[0,0,1]`
- Results: `[ [3,0,0], [1,2,0], [2,1,0] ]`

Bad: `0*3 + 1*0 + 2*0` = 0
Good: `0*1 + 1*2 + 2*0` = 2
Amazing: `0*2 + 1*1 + 2*0` = 1

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 3  | 1  | 1  | -  | No  |

### Multiple choice

Choose your 3 favorite colours out of 5: green:0, blue:1, pink:2, orange:3, black:4

- Vote Envelope: `[1,1,1,0,0]` `[0,1,1,1,0]` `[1,1,0,0,0]`
- Results: `[ [1, 2], [0, 3], [1, 2], [2, 1], [3, 0] ]`

green: `0*1 + 2*1` = 2
blue: `0*0 + 1*3` = 3
pink: `0*1 + 1*2` = 2
orange: `0*2 + 1*1` = 1
black: `0*3 + 0*1` = 0

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 5  | 1  | 3  | -  | No  |

<!-- > DO WE NEED a minTotalCost parameter? If minTotalCost=3, then the last envelope needs a +1, so we obligate the user to make at least 3 choices. -->

### Linear Weighted choice

Sort your 5 favourite blockchains: Bitcoin:0, Ethereum:1, Monero:2, Zcash:3, Polkadot:4. 

Your first option gets 5 points,... the last 0 points.

- Vote Envelope: `[0,3,1,4,2]` `[3,0,1,4,2]` `[1,2,3,4,0]`
- Results;`[ [1,1,0,1,0], [1,0,1,1,0], [0,2,1,0,0], [0,0,0,0,3], [1,0,2,0,0] ]`

Bitcoin: `0*1 + 1*1 + 2*0 + 3*1 + 0*4` = 4
Ethereum: `0*1 + 1*0 + 2*1 + 3*1 + 0*4` = 5
Monero: `0*1 + 1*2 + 2*1 + 3*0 + 4*0` = 6
Zcash: `0*0 + 1*0 + 2*0 + 3*0 + 4*3` = 12
Polkadot: `0*1 + 1*0 + 2*2 + 3*0 + 4*0` = 4

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 5  | 4  | -  | -  | Yes  |

### Quadratic voting

You might distribute 12 credits among 4 NGOs. You can give as many tokens as you wish to a single option, but the cost raises exponentially with each additional token added to an option.

NGOs are: greenpeace:0, redcross:1, msf:2, amnesty:3

- Vote Envelopes: `[2,2,2,0]` `[1,1,2,2]` `[0,3,1,1]`

```
Cost exponent calculations:

			[2,    2,    2,    0]
envelope 1 calculation: 2^2 + 2^2 + 2^2 + 0^2
		      =  4  +  4  +  4  +  0  = 12 credits

			[1,    1,    2,    2]
envelope 2 calculation: 1^2 + 1^2 + 2^2 + 2^2
		      =  1  +  1  +  4  +  4  = 10 credits

			[0,    3,    1,    1]
envelope 3 calculation: 0^2 + 3^2 + 1^2 + 1^2
		      =  0  +  9  +  1  +  1  = 11 credits
```

- Results: `[ [1,1,1,0], [0,1,1,1], [0,1,2,0], [1,1,1,0] ]`

greenpeace: `0*1 + 1*1 + 2*1 + 3*0` = 3
redcross: `0*0 + 1*1 + 2*1 + 3*1` = 6
msf: `0*0 + 1*1 + 2*2 + 3*0` = 5
amnesty: `0*1 + 1*1 + 2*1 + 3*0` = 3

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 4  | -  | 12  | 2  | No  |

### Multiquestion

This mode requires a different way of interpreting the results since the position of the results array is not multiplied by its position index.

3 positions (CEO, COO, CFO), 5 candidates

- Ballots: `[4,3,2]` `[4,2,3]` `[0,1,4]`
- Results: `[ [1,0,0,0,2], [0,1,1,1,0], [0,0,1,1,1] ]`

CEO: candidate0:1 candidate4:2
COO: candidate1:1 candidate2:1 candidate3:1
CFO: candidate2:1 candidate3:1 candidate4:1

```
Vote Envelopes: [4,3,2] [4,2,3] [0,1,4]

                         CEO              COO              C
Option A results: [ [1, 0, 0, 0, 2], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1] ]
(presented as: for each position, how many votes did each candidate receive?)

    CANDIDATE           1          2          3          4          5
Option B results: [ [1, 0, 0], [0, 1, 0], [0, 1, 1], [0, 1, 1], [2, 0, 1] ]
(presented as: for each candidate, how many votes did they receive for each position?)

                    TOTALS
Option C results: [8, 6, 9]
(this option is a simple sum- it makes no sense for scenario with discrete option values such as this one)

```

| maxCount | maxValue  | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|
| 3  | 4  | -  | -  | No  |

---

## Vocdoni results interpretation (Draft)

Results interpretation is not part of the ballot protocol, but the Process Metadata has a couple of flags describing the interpretation that is expected.

```json
    "results": {
        "aggregation": "index-weighted", // "index-weighted" | "discrete-counting",
        "display": "rating" // "rating" | "simple-question" | "multiple-choice" | "linear-weighted" | "quadratic-voting" | "multiple-question" | "raw"
    }
```

The results provided by the scrutinizer contain a preliminary aggregation in a bidimensional matrix, where the final step needs to be completed by UI clients, depending on `results.aggregation`.

### Single question

Index (weighted): each field value is multiplied by its position index, then added. 

```json
[ [1,2], [0,1] ] => [0*1+1*2], [0*0+1*1] => [2,1]
option1: 2 votes
option2: 1 votes
```

Extended features (quadratic voting, etc)

Can be weighted

### Multi question

Multi question (discrete): field values are just counted (weight = 1)

```json
[ [1,2], [0,1] ] => [ [question1], [question2] ]
field1: candidate0: 1 votes, candidate1: 2 votes
field2: candidate0: 0 votes, candidate1: 1 votes
```

(Restricted features)

![https://gitlab.com/p4u/drawio/-/raw/master/ballot-results.png?inline=false](https://gitlab.com/p4u/drawio/-/raw/master/ballot-results.png?inline=false)


### Coming next

See the [JSON API](/architecture/protocol/json-api) section.
