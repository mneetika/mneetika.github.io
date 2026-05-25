---
layout: single
comments: true
title: Top N Tickers by Traded Volume
date: 2026-03-20 11:00:00-0000
categories: C++
tags: [cpp, algorithms, hashmap, ordered-set, heap, trading]
---

## Problem

There is a stream of trades.
Each trade contains:

- `ticker`
- `volume`

At any point, we need to print the top `n` tickers by total traded volume.

Implement:

- `execute_trade(ticker, volume)`
- `print_top_n_trades(n)`

## Idea

We need two operations:

- update one ticker's total volume when a trade arrives
- query the current top `n` tickers quickly

Use:

- `unordered_map<string, long long>` to store the current total volume per ticker
- `set<TradeVolume>` to keep tickers sorted by volume

The main detail is updates:

- when a new trade for ticker `T` arrives, first remove its old `TradeVolume` entry from the set
- update the total in the hash map
- insert the new `TradeVolume` entry into the set

To get highest volume first, use a custom comparator:

- larger total volume comes first
- if two tickers have the same volume, sort by ticker name

## Complexity

- `execute_trade`: `O(log m)` where `m` is number of distinct tickers
- `print_top_n_trades(n)`: `O(n)`
- space: `O(m)`

## Code

{% highlight c++ %}
#include <iostream>
#include <set>
#include <string>
#include <unordered_map>

struct TradeVolume {
  std::string ticker;
  long long totalVolume;
};

struct TradeVolumeCompare {
  bool operator()(const TradeVolume& left, const TradeVolume& right) const {
    if (left.totalVolume != right.totalVolume) {
      return left.totalVolume > right.totalVolume;
    }
    return left.ticker < right.ticker;
  }
};

class TradeTracker {
 public:
  void executeTrade(const std::string& ticker, long long volume) {
    auto volumeIt = totalVolumeByTicker.find(ticker);
    if (volumeIt != totalVolumeByTicker.end()) {
      orderedTrades.erase(TradeVolume{ticker, volumeIt->second});
      volumeIt->second += volume;
      orderedTrades.insert(TradeVolume{ticker, volumeIt->second});
      return;
    }

    totalVolumeByTicker[ticker] = volume;
    orderedTrades.insert(TradeVolume{ticker, volume});
  }

  void printTopNTrades(int n) const {
    int printed = 0;
    for (const auto& tradeVolume : orderedTrades) {
      if (printed == n) {
        break;
      }
      std::cout << tradeVolume.ticker << " " << tradeVolume.totalVolume << "\n";
      ++printed;
    }
  }

 private:
  std::unordered_map<std::string, long long> totalVolumeByTicker;
  std::set<TradeVolume, TradeVolumeCompare> orderedTrades;
};

int main() {
  TradeTracker tracker;

  tracker.executeTrade("AAPL", 100);
  tracker.executeTrade("MSFT", 200);
  tracker.executeTrade("GOOG", 150);
  tracker.executeTrade("AAPL", 75);
  tracker.executeTrade("TSLA", 300);

  tracker.printTopNTrades(3);
  return 0;
}
{% endhighlight %}

## Dry Run

After these trades:

- `AAPL 100`
- `MSFT 200`
- `GOOG 150`
- `AAPL 75`
- `TSLA 300`

The total traded volumes become:

- `TSLA = 300`
- `AAPL = 175`
- `MSFT = 200`
- `GOOG = 150`

So `print_top_n_trades(3)` prints:

{% highlight text %}
TSLA 300
MSFT 200
AAPL 175
{% endhighlight %}

## Why Not Just Use a Heap?

A heap is good for retrieving the maximum, but updates are awkward when the same ticker appears many times.

If we use only a heap:

- every new trade pushes a new value
- old values become stale
- top queries need lazy deletion logic

That works, but for this problem a `hash map + set` is cleaner because each ticker appears only once in the ordered structure.

Also, using a comparator is usually clearer than storing negative volume because the ordering rule is explicit in the code.

## Edge Cases

- If `n` is larger than the number of tickers, print all available tickers.
- If the same ticker appears repeatedly, keep adding to its total volume.
- Use `long long` for total volume to avoid overflow when the stream is large.

## Heap + Hash Map Approach

This is another good solution, and it is often easier to explain across languages like Python, Java, and TypeScript.

Use:

- `unordered_map<string, long long>` for the latest total volume of each ticker
- `priority_queue<TradeVolume>` as a max-heap

Idea:

- every `executeTrade` updates the hash map
- then push the new `TradeVolume` into the heap
- the heap may now contain stale entries for the same ticker
- while printing top `n`, discard stale heap entries until the top matches the latest value in the hash map

This is called lazy deletion.

### Code

{% highlight c++ %}
#include <iostream>
#include <functional>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>

struct TradeVolume {
  std::string ticker;
  long long totalVolume;
};

struct MaxHeapTradeVolumeCompare {
  bool operator()(const TradeVolume& left, const TradeVolume& right) const {
    if (left.totalVolume != right.totalVolume) {
      return left.totalVolume < right.totalVolume;
    }
    return left.ticker > right.ticker;
  }
};

class TradeTrackerHeap {
 public:
  void executeTrade(const std::string& ticker, long long volume) {
    totalVolumeByTicker[ticker] += volume;
    maxHeap.push(TradeVolume{ticker, totalVolumeByTicker[ticker]});
  }

  void printTopNTrades(int n) {
    std::vector<TradeVolume> validTradesToRestore;
    int printed = 0;

    while (!maxHeap.empty() && printed < n) {
      TradeVolume currentTrade = maxHeap.top();
      maxHeap.pop();

      auto volumeIt = totalVolumeByTicker.find(currentTrade.ticker);
      // The heap can contain older snapshots for the same ticker.
      // Only the entry matching the latest total in the hash map is valid.
      if (volumeIt == totalVolumeByTicker.end() ||
          volumeIt->second != currentTrade.totalVolume) {
        continue;
      }

      std::cout << currentTrade.ticker << " " << currentTrade.totalVolume << "\n";
      validTradesToRestore.push_back(currentTrade);
      ++printed;
    }

    for (const auto& tradeVolume : validTradesToRestore) {
      maxHeap.push(tradeVolume);
    }
  }

 private:
  std::unordered_map<std::string, long long> totalVolumeByTicker;
  std::priority_queue<TradeVolume,
                      std::vector<TradeVolume>,
                      MaxHeapTradeVolumeCompare>
      maxHeap;
};
{% endhighlight %}

### Why Stale Entries Happen

Suppose:

- `AAPL 100`
- `AAPL 50`

After these trades:

- hash map says `AAPL = 150`
- heap contains both `TradeVolume{"AAPL", 100}` and `TradeVolume{"AAPL", 150}`

When we query:

- `(150, AAPL)` is valid
- `(100, AAPL)` is stale and must be ignored

That is what this code is checking:

{% highlight c++ %}
auto volumeIt = totalVolumeByTicker.find(currentTrade.ticker);
if (volumeIt == totalVolumeByTicker.end() ||
    volumeIt->second != currentTrade.totalVolume) {
  continue;
}
{% endhighlight %}

How to read it:

- look up the latest total volume for `currentTrade.ticker` in the hash map
- compare that latest value with the volume stored in the heap entry
- if they are different, the heap entry is an older snapshot, so skip it

Example:

- after `executeTrade("AAPL", 100)`, heap has `TradeVolume{"AAPL", 100}`
- after `executeTrade("AAPL", 50)`, hash map says `AAPL = 150`, and heap also gets `TradeVolume{"AAPL", 150}`
- if the heap returns `TradeVolume{"AAPL", 100}`, the map says the latest total is `150`
- since `100 != 150`, this entry is stale and should be ignored
- if the heap returns `TradeVolume{"AAPL", 150}`, it matches the map and is valid

So the rule is simple:

- heap entry = candidate
- hash map = source of truth
- only print the heap entry if both match

### Complexity

- `execute_trade`: `O(log k)` where `k` is the number of heap entries
- `print_top_n_trades(n)`: not strictly `O(n)` because stale entries may need to be popped
- space: larger than the `set` approach because the heap keeps old entries

### Set vs Heap

- `hash map + set` keeps only one ordered entry per ticker and gives cleaner top-`n` queries
- `hash map + heap` is more portable across languages, but needs lazy deletion
- for C++, the `set` approach is cleaner
- for interview discussion across multiple languages, the heap version is often easier to generalize
