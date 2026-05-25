---
layout: single
comments: true
title: Shortest Path and MST
date: 2026-02-25 10:00:00-0000
categories: C++
tags: [cpp, algorithms, graph, shortest-path, mst]
---

## Dijkstra (Non-negative Weights)
Dijkstra finds shortest distance from one source when edge weights are non-negative.
Core idea: always expand the currently closest unfinalized node.
How it works: min-heap gives next best node; relax outgoing edges.

Dry-run:
- Edges: `0->1(4), 0->2(1), 2->1(2), 1->3(1), 2->3(5)`.
- Start `dist[0]=0`.
- Pick `0`, relax -> `dist[1]=4`, `dist[2]=1`.
- Pick `2`, relax -> `dist[1]=3`, `dist[3]=6`.
- Pick `1`, relax -> `dist[3]=4`.
- Final: `[0, 3, 1, 4]`.

Complexity:
- Time `O((V + E) log V)` with binary heap.
- Space `O(V + E)`.

Edge-case checklist:
- Negative edge weights (algorithm becomes invalid).
- Overflow when adding distances (use large but safe INF).
- Disconnected nodes should remain INF.

{% highlight c++ %}
#include <limits>
#include <queue>
#include <utility>
#include <vector>

std::vector<int> dijkstra(int n, int src,
                          const std::vector<std::vector<std::pair<int, int>>>& adj) {
  const int kInf = std::numeric_limits<int>::max() / 4;
  std::vector<int> dist(n, kInf);
  using State = std::pair<int, int>;  // {dist, node}
  std::priority_queue<State, std::vector<State>, std::greater<State>> pq;

  dist[src] = 0;
  pq.push({0, src});

  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d != dist[u]) {
      continue;
    }

    for (const auto& [v, w] : adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({dist[v], v});
      }
    }
  }
  return dist;
}
{% endhighlight %}

## Bellman-Ford
Bellman-Ford handles negative weights and can detect negative cycles.
Core idea: relax all edges `n-1` times because shortest path has at most `n-1` edges.
How it works: one extra pass checks if any edge can still relax -> negative cycle.

Dry-run:
- Edges: `0->1(1), 1->2(-1), 0->2(4)`.
- Iteration 1: `dist[1]=1`, `dist[2]=0`.
- Iteration 2: no better update.
- Extra pass: no update -> no negative cycle.

Complexity:
- Time `O(V * E)`.
- Space `O(V)`.

Edge-case checklist:
- Negative cycle reachable from source.
- Using too-small INF causing overflow when relaxing.

{% highlight c++ %}
#include <limits>
#include <tuple>
#include <vector>

struct BellmanFordResult {
  std::vector<int> dist;
  bool has_negative_cycle;
};

BellmanFordResult bellmanFord(
    int n, int src, const std::vector<std::tuple<int, int, int>>& edges) {
  const int kInf = std::numeric_limits<int>::max() / 4;
  std::vector<int> dist(n, kInf);
  dist[src] = 0;

  for (int i = 0; i < n - 1; ++i) {
    bool changed = false;
    for (const auto& [u, v, w] : edges) {
      if (dist[u] == kInf) {
        continue;
      }
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }

  bool has_negative_cycle = false;
  for (const auto& [u, v, w] : edges) {
    if (dist[u] != kInf && dist[u] + w < dist[v]) {
      has_negative_cycle = true;
      break;
    }
  }

  return {dist, has_negative_cycle};
}
{% endhighlight %}

## Floyd-Warshall
Floyd-Warshall computes all-pairs shortest paths.
Core idea: dynamic programming over intermediate node `k`.
How it works: for every `(i, j)`, try route `i -> k -> j` and take minimum.

Dry-run:
- Initial matrix: `dist[0][1]=3`, `dist[1][2]=2`, `dist[0][2]=10`.
- When `k=1`: update `dist[0][2] = min(10, 3+2) = 5`.
- Result includes shortest `0->2 = 5`.

Complexity:
- Time `O(V^3)`.
- Space `O(V^2)`.

Edge-case checklist:
- Initialize `dist[i][i]=0`.
- Directed vs undirected matrix initialization mismatch.

{% highlight c++ %}
#include <algorithm>
#include <limits>
#include <vector>

std::vector<std::vector<int>> floydWarshall(std::vector<std::vector<int>> dist) {
  int n = static_cast<int>(dist.size());
  const int kInf = std::numeric_limits<int>::max() / 4;

  for (int k = 0; k < n; ++k) {
    for (int i = 0; i < n; ++i) {
      for (int j = 0; j < n; ++j) {
        if (dist[i][k] == kInf || dist[k][j] == kInf) {
          continue;
        }
        dist[i][j] = std::min(dist[i][j], dist[i][k] + dist[k][j]);
      }
    }
  }
  return dist;
}
{% endhighlight %}

## Kruskal MST
Kruskal builds minimum spanning tree by picking cheapest safe edges.
Core idea: sort edges by weight and use DSU to avoid cycles.
How it works: take an edge if it connects two different components.

Dry-run:
- Weighted edges: `(0,1,1), (1,2,2), (0,2,3), (2,3,4)`.
- Pick `(0,1)`, pick `(1,2)`, skip `(0,2)` (cycle), pick `(2,3)`.
- MST weight = `1 + 2 + 4 = 7`.

Complexity:
- Time `O(E log E)` for sorting + near-constant DSU ops.
- Space `O(V)` for DSU (plus edge storage).

Edge-case checklist:
- Disconnected graph -> MST does not exist.
- Sorting by wrong tuple field (weight must be key).

{% highlight c++ %}
#include <algorithm>
#include <tuple>
#include <vector>

int kruskalMstWeight(int n, std::vector<std::tuple<int, int, int>> edges) {
  std::sort(edges.begin(), edges.end(),
            [](const auto& a, const auto& b) { return std::get<2>(a) < std::get<2>(b); });

  Dsu dsu(n);
  int total = 0;
  int used = 0;

  for (const auto& [u, v, w] : edges) {
    if (dsu.unionSets(u, v)) {
      total += w;
      ++used;
      if (used == n - 1) {
        break;
      }
    }
  }
  return (used == n - 1) ? total : -1;
}
{% endhighlight %}

## Prim MST
Prim also builds MST but grows from a starting node.
Core idea: always pick smallest edge crossing from visited to unvisited set.
How it works: min-heap stores candidate edges; mark nodes when added to MST.

Dry-run:
- Start at node `0`.
- Candidate edges from `0`: `(0-1,1), (0-2,3)`, pick weight `1`.
- Add edges from `1`: includes `(1-2,2)`, now pick weight `2`.
- Continue until all nodes included; total matches MST.

Complexity:
- Time `O((V + E) log V)` with adjacency list + heap.
- Space `O(V + E)`.

Edge-case checklist:
- Disconnected graph (should return invalid marker).
- Starting node choice does not affect final MST weight (for connected graph).

{% highlight c++ %}
#include <queue>
#include <utility>
#include <vector>

int primMstWeight(int n, const std::vector<std::vector<std::pair<int, int>>>& adj) {
  using Edge = std::pair<int, int>;  // {weight, node}
  std::priority_queue<Edge, std::vector<Edge>, std::greater<Edge>> pq;
  std::vector<bool> in_mst(n, false);

  int total = 0;
  int count = 0;
  pq.push({0, 0});

  while (!pq.empty() && count < n) {
    auto [w, u] = pq.top();
    pq.pop();
    if (in_mst[u]) {
      continue;
    }

    in_mst[u] = true;
    total += w;
    ++count;

    for (const auto& [v, wt] : adj[u]) {
      if (!in_mst[v]) {
        pq.push({wt, v});
      }
    }
  }

  return (count == n) ? total : -1;
}
{% endhighlight %}
