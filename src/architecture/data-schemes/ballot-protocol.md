# Ballot Protocol

The Vocdoni Ballot Protocol aims to be a very simple yet powerful specification for the representation of ballots and results for a voting process.


A ***voting process*** is made out of one or more ***fields***, each of which represents a single question or an option for a question, depending on the ***type of process***. When voting, eligible voters choose from a set of predefined ***answers*** for each field. The allowed number of answers, type of answer, etc. also depend on the specific type of process. An eligible voter expresses their choices by casting a ***ballot***.

A ballot is represented as an array (or list) of natural numbers. Each position of the array contains an answer to one of the process' fields.

Results are accumulated in a two-dimension array of natural numbers (a matrix). Each row of this matrix corresponds to a ballot field, and each column corresponds to one of the possible values for that field. Any number in the results matrix is simply a count of the votes for the value represented at that index.
 
_A more thorough introduction is available on [our blog](https://blog.aragon.org/vocdoni-ballot-protocol/)._

![https://blog.aragon.org/content/images/2021/04/process-generic-1-1.png](https://blog.aragon.org/content/images/2021/04/process-generic-1-1.png)

The protocol is composed by a set of numeric and boolean variables that restrict the format of the ballot. They are defined in the [Process Parameters](/architecture/smart-contracts/process?id=contract-structs).

- `uint8 maxCount`
Max number of fields per ballot. 1 <= maxCount <= 100.
- `uint8 maxValue`
Determines the acceptable maximum value for all fields.
- `uint8 minValue` 
Determines the acceptable minimum value for all fields.
- `bool uniqueValues`
Choices for a question cannot appear twice or more
- `uint16 maxTotalCost`
Maximum limit on the total sum of all ballot fields' values (if applicable).
0 => No limit / Not applicable.
- `uint16 minTotalCost`
Minimum limit on the total sum of all ballot fields' values (if applicable).
0 => No limit / Not applicable.
- `uint16 costExponent`
The exponent that will be used to compute the "cost" of the field values.
  - `totalCost = Σ (value[i] ^ costExponent) <= maxTotalCost`
  - `costExponent` is represented as `exp * 10000` so:
    - 0 => 0.0000
    - 10000 => 1.0000
    - 65535 => 6.5535

![https://blog.aragon.org/content/images/2021/04/ballot-variables-1.png](https://blog.aragon.org/content/images/2021/04/ballot-variables-1.png)

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

The ballot protocol does not cover interpretation. However, a very common interpretation would be to consider each field as the multiplier (weight) equal to its position.

- First question [1,2,3] = `0*1 + 1*2 + 2*3` = `0 + 2 + 6` = 8
- Second question [0,4,2] = `0*0 + 1*4 + 2*2` = 8
- Third question [5,1,0] = `0*5 + 1*1 + 2*0` = 1

6 votes have been cast.

### Example

Lets see an example with `maxCount=3` and `maxValue=5` 

The human-friendly question would be: *Rate these 3 candidates to the best rock music player of the 20th century, from 0 to 5 stars.*

- Lennon is the candidate 0, so question 0
- Hendrix is the candidate 1, so question 1
- Joplin is the candidate 2, so question 2

Let's start, currently there are no votes cast:

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

- Vote Envelopes: `[2]` `[5]` `[2]`
- Results: [ [0,0,2,0,0,1] ]

Two users have given 2 stars
One user have given 5 stars

**Parameters**

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 1  | 0 | 5  | - | -  | -  | No  |

### Rate 3 candidates

Lennon, Hendrix, Joplin ⇒ 0, 1, 2

- Vote Envelope: `[2,1,2]` `[0,1,2]` `[0,0,0]`
- Results: `[ [2,0,1], [1,2,0], [1,0,2] ]`

Lennon got `2*0 + 0*1 + 1*2` = 2 points
Hendrix got `1*0 + 2*1 + 0*2` = 2 points
Joplin got `1*0 + 0*1 + 2*2` = 4 points

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 3  | 0 | 2  | - | -  | -  | Yes  |

### Single choice

How do you feel today? Choose 1 out of 3 possible options: Bad, Good, Amazing

- Vote Envelopes: `[0,1,0]` `[0,1,0]` `[0,0,1]`
- Results: `[ [3,0,0], [1,2,0], [2,1,0] ]`

Bad: `0*3 + 1*0 + 2*0` = 0
Good: `0*1 + 1*2 + 2*0` = 2
Amazing: `0*2 + 1*1 + 2*0` = 1

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 3  | 0 | 1  | 1 | 1  | -  | No  |

### Multiple choice

Choose your 3 favorite colours out of 5: green:0, blue:1, pink:2, orange:3, black:4

- Vote Envelope: `[1,1,1,0,0]` `[0,1,1,1,0]` `[1,1,1,0,0]`
- Results: `[ [1, 2], [0, 3], [0, 3], [2, 1], [3, 0] ]`

green: `0*1 + 2*1` = 2
blue: `0*0 + 1*3` = 3
pink: `0*0 + 1*3` = 3
orange: `0*2 + 1*1` = 1
black: `0*3 + 0*1` = 0

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 5  | 0 | 1  | 3 | 3  | -  | No  |

### Linear Weighted choice

Sort your 5 favorite blockchains: Bitcoin:0, Ethereum:1, Monero:2, Zcash:3, Polkadot:4. 

Your first option gets 5 points,... the last 0 points.

- Vote Envelope: `[0,3,1,4,2]` `[3,0,1,4,2]` `[1,2,3,4,0]`
- Results;`[ [1,1,0,1,0], [1,0,1,1,0], [0,2,1,0,0], [0,0,0,0,3], [1,0,2,0,0] ]`

Bitcoin: `0*1 + 1*1 + 2*0 + 3*1 + 0*4` = 4
Ethereum: `0*1 + 1*0 + 2*1 + 3*1 + 0*4` = 5
Monero: `0*1 + 1*2 + 2*1 + 3*0 + 4*0` = 6
Zcash: `0*0 + 1*0 + 2*0 + 3*0 + 4*3` = 12
Polkadot: `0*1 + 1*0 + 2*2 + 3*0 + 4*0` = 4

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 5  | 0 | 4  | - | -  | -  | Yes  |

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

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 4  | 0 | -  | 0 | 12  | 20000  | No  |

### Multiquestion

This mode requires a different way of interpreting the results, since each position of the results array is not multiplied by its index.

3 positions (CEO, COO, CFO), 5 candidates

- Ballots: `[4,3,2]` `[4,2,3]` `[0,1,4]`
- Results: `[ [1,0,0,0,2], [0,1,1,1,0], [0,0,1,1,1] ]`

CEO: candidate0:1 candidate4:2
COO: candidate1:1 candidate2:1 candidate3:1
CFO: candidate2:1 candidate3:1 candidate4:1

```
Vote Envelopes: [4,3,2] [4,2,3] [0,1,4]

                         CEO              COO              CFO
Option A results: [ [1, 0, 0, 0, 2], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1] ]

Candidate 5 has won the CEO position, whereas COO is tied between candidates 2, 3, and 4, and CFO is tied between candidates 3, 4, and 5.

```

| maxCount | minValue | maxValue | minTotalCost | maxTotalCost  | costExponent  | uniqueValues  |
|---|---|---|---|---|---|---|
| 3  | 0 | 4  | - | -  | -  | No  |

---

## Vocdoni results interpretation

Results interpretation is not part of the ballot protocol, but it informs how the protocol should be understood and displayed. The Process Metadata has a couple of flags describing the expected interpretation.

```json
    "results": {
        "aggregation": "index-weighted", // "index-weighted" | "discrete-counting",
        "display": "rating" // "rating" | "simple-question" | "multiple-choice" | "linear-weighted" | "quadratic-voting" | "multiple-question" | "raw"
    }
```

The results provided by the scrutinizer contain a preliminary aggregation in a 2-dimensional matrix, where the final step needs to be completed by UI clients, depending on `results.aggregation`.

### Single question

Index-weighted: each option's value is multiplied by its position index, then summed. 

```json
[ [1,0,1], [2,0,0], [0,1,1] ] => [0*1+1*0+2*1], [0*2+1*0+2*0], [0*1+1*1+2*1] => [2,0,3]
option1: 2 votes
option2: 0 votes
option3: 3 votes
```

This interpretation suits any case with extended features, such as multiple choice, quadratic voting, linear-weighted, etc. This is because it is able to weigh multiple possible values for a single field.

![https://blog.aragon.org/content/images/2021/04/results-generic-index-1.png](https://blog.aragon.org/content/images/2021/04/results-generic-index-1.png)

### Multi question

Discrete values: field values are just counted (weight = 1)

```json
[ [1,2,0], [0,1,2], [1,1,1] ] => [ [question1], [question2], [question3] ]
field1: candidate0: 1 vote, candidate1: 2 votes, candidate 3: 0 votes
field2: candidate0: 0 votes, candidate1: 1 vote, candidate 2: 2 votes
field2: candidate0: 1 vote, candidate1: 1 vote, candidate 2: 1 vote
```

As this format can only accept binary (yes/no) input for each option, it is only available for use with a basic set of features (multi-question, single-choice)

![https://blog.aragon.org/content/images/2021/04/results-generic-discrete-1.png](https://blog.aragon.org/content/images/2021/04/results-generic-discrete-1.png)

### Coming next

See the [JSON API](/architecture/protocol/json-api) section.
