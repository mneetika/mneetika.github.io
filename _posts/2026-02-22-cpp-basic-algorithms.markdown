---
layout: single
comments: true
title: Basic Algorithms
date: 2026-02-22 10:00:00-0000
categories: C++
tags: [cpp, algorithms, graph, heap, trie]
---

## 1. Graph: Graph Class + BFS and DFS
Use graph templates when problems involve entities connected by edges.
Core idea: represent connections as an adjacency list so neighbors are fast to iterate.
How it works: build the graph once, then run traversal depending on need.
- BFS explores level by level (shortest path in unweighted graphs).
- DFS explores depth-first (good for components, cycles, reachability).

Dry-run:
- Graph edges: `(0-1), (0-2), (1-3), (2-4)`.
- BFS from `0`: visit order `[0, 1, 2, 3, 4]`.
- DFS (recursive) from `0`: one valid order `[0, 1, 3, 2, 4]`.
- DFS (iterative) from `0`: depends on neighbor push order, but still depth-first.

Complexity:
- BFS: Time `O(V + E)`, Space `O(V)`.
- DFS (recursive/iterative): Time `O(V + E)`, Space `O(V)`.

Edge-case checklist:
- Empty graph / invalid start node.
- Disconnected graph (need outer loop if full traversal is required).
- Directed vs undirected edge insertion confusion.

{% highlight c++ %}
#include <vector>

class Graph {
 public:
  explicit Graph(int nodes) : adj_(nodes) {}

  void addEdge(int u, int v, bool undirected = true) {
    adj_[u].push_back(v);
    if (undirected) {
      adj_[v].push_back(u);
    }
  }

  const std::vector<int>& neighbors(int u) const { return adj_[u]; }
  int size() const { return static_cast<int>(adj_.size()); }

 private:
  std::vector<std::vector<int>> adj_;
};
{% endhighlight %}

### BFS (non-recursive)

{% highlight c++ %}
#include <queue>
#include <vector>

std::vector<int> bfsIterative(const Graph& graph, int start) {
  std::vector<int> order;
  std::vector<bool> visited(graph.size(), false);
  std::queue<int> q;

  visited[start] = true;
  q.push(start);

  while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);

    for (int v : graph.neighbors(u)) {
      if (!visited[v]) {
        visited[v] = true;
        q.push(v);
      }
    }
  }

  return order;
}
{% endhighlight %}

### BFS (recursive style)

{% highlight c++ %}
#include <queue>
#include <vector>

void consumeQueueRecursive(const Graph& graph, std::queue<int>& q,
                           std::vector<bool>& visited,
                           std::vector<int>& order) {
  if (q.empty()) {
    return;
  }

  int u = q.front();
  q.pop();
  order.push_back(u);

  for (int v : graph.neighbors(u)) {
    if (!visited[v]) {
      visited[v] = true;
      q.push(v);
    }
  }

  consumeQueueRecursive(graph, q, visited, order);
}

std::vector<int> bfsRecursive(const Graph& graph, int start) {
  std::vector<int> order;
  std::vector<bool> visited(graph.size(), false);
  std::queue<int> q;
  visited[start] = true;
  q.push(start);
  consumeQueueRecursive(graph, q, visited, order);
  return order;
}
{% endhighlight %}

### DFS (recursive)

{% highlight c++ %}
#include <vector>

void dfsRecursiveHelper(const Graph& graph, int u, std::vector<bool>& visited,
                        std::vector<int>& order) {
  visited[u] = true;
  order.push_back(u);

  for (int v : graph.neighbors(u)) {
    if (!visited[v]) {
      dfsRecursiveHelper(graph, v, visited, order);
    }
  }
}

std::vector<int> dfsRecursive(const Graph& graph, int start) {
  std::vector<int> order;
  std::vector<bool> visited(graph.size(), false);
  dfsRecursiveHelper(graph, start, visited, order);
  return order;
}
{% endhighlight %}

### DFS (non-recursive)

{% highlight c++ %}
#include <stack>
#include <vector>

std::vector<int> dfsIterative(const Graph& graph, int start) {
  std::vector<int> order;
  std::vector<bool> visited(graph.size(), false);
  std::stack<int> st;
  st.push(start);

  while (!st.empty()) {
    int u = st.top();
    st.pop();

    if (visited[u]) {
      continue;
    }

    visited[u] = true;
    order.push_back(u);

    const std::vector<int>& nbrs = graph.neighbors(u);
    for (int i = static_cast<int>(nbrs.size()) - 1; i >= 0; --i) {
      int v = nbrs[i];
      if (!visited[v]) {
        st.push(v);
      }
    }
  }

  return order;
}
{% endhighlight %}

## 2. Max and Min Priority Heap with `operator()`
A priority queue keeps the most important element at the top.
Core idea: customize ordering with `operator()` in a comparator.
How it works:
- Max-heap comparator keeps larger key higher priority.
- Min-heap comparator keeps smaller key higher priority.

Dry-run:
- Push keys: `10, 4, 15`.
- Max-heap top sequence: `15` then `10` then `4`.
- Min-heap top sequence: `4` then `10` then `15`.

Complexity:
- `push`: `O(log n)`.
- `top`: `O(1)`.
- `pop`: `O(log n)`.

Edge-case checklist:
- Comparator direction reversed accidentally.
- Equal-key tie behavior not explicitly defined.

{% highlight c++ %}
#include <queue>
#include <vector>

struct Item {
  int key;
  int value;
};

struct MaxCompare {
  bool operator()(const Item& a, const Item& b) const { return a.key < b.key; }
};

struct MinCompare {
  bool operator()(const Item& a, const Item& b) const { return a.key > b.key; }
};

void usePriorityQueues() {
  std::priority_queue<Item, std::vector<Item>, MaxCompare> max_heap;
  std::priority_queue<Item, std::vector<Item>, MinCompare> min_heap;

  max_heap.push({10, 1});
  max_heap.push({4, 2});
  max_heap.push({15, 3});

  min_heap.push({10, 1});
  min_heap.push({4, 2});
  min_heap.push({15, 3});
}
{% endhighlight %}

## 3. Trie: Add and Delete
Trie is a tree for strings where each edge is a character.
Core idea: share common prefixes so operations depend on word length, not number of words.
How it works:
- `insert`: walk/create nodes character by character, mark end.
- `search`: walk character by character, verify end marker.
- `erase`: unmark end, then delete unused tail nodes during recursion.

`std::array<Node*, 26>` is used because the alphabet is fixed (`a-z`), so child lookup is `O(1)` and cache-friendly.

Dry-run:
- Insert `cat`, `car`.
- Search `cat` -> `true`, search `cap` -> `false`.
- Erase `cat`: only `t` path is removed; `car` still exists.
- Search `car` -> `true`, search `cat` -> `false`.

Complexity:
- `insert/search/erase`: Time `O(L)` where `L` is word length.
- Space: up to `O(total_characters_inserted)`.

Edge-case checklist:
- Non-lowercase input with fixed `a-z` mapping.
- Deleting a word that is a prefix of another (`car` vs `cart`).
- Re-deleting an already deleted word.

{% highlight c++ %}
#include <array>
#include <string>

class Trie {
 private:
  static constexpr int kAlphabetSize = 26;

  struct Node {
    bool is_end = false;
    std::array<Node*, kAlphabetSize> next;

    Node() { next.fill(nullptr); }
  };

  Node* root_ = new Node();

  bool hasChildren(Node* node) const {
    for (Node* child : node->next) {
      if (child != nullptr) {
        return true;
      }
    }
    return false;
  }

  bool eraseHelper(Node* node, const std::string& word, int depth,
                   bool& deleted) {
    if (node == nullptr) {
      return false;
    }

    if (depth == static_cast<int>(word.size())) {
      if (!node->is_end) {
        return false;
      }
      node->is_end = false;
      deleted = true;
      return !hasChildren(node);
    }

    int idx = word[depth] - 'a';
    if (node->next[idx] == nullptr) {
      return false;
    }

    bool should_delete_child =
        eraseHelper(node->next[idx], word, depth + 1, deleted);
    if (should_delete_child) {
      delete node->next[idx];
      node->next[idx] = nullptr;
    }

    if (!deleted) {
      return false;
    }
    return !node->is_end && !hasChildren(node);
  }

 public:
  void insert(const std::string& word) {
    Node* cur = root_;
    for (char c : word) {
      int idx = c - 'a';
      if (cur->next[idx] == nullptr) {
        cur->next[idx] = new Node();
      }
      cur = cur->next[idx];
    }
    cur->is_end = true;
  }

  bool search(const std::string& word) const {
    Node* cur = root_;
    for (char c : word) {
      int idx = c - 'a';
      if (cur->next[idx] == nullptr) {
        return false;
      }
      cur = cur->next[idx];
    }
    return cur->is_end;
  }

  bool erase(const std::string& word) {
    bool deleted = false;
    eraseHelper(root_, word, 0, deleted);
    return deleted;
  }
};
{% endhighlight %}

## 4. Custom Heap with Insert and Delete
A custom heap is useful when you need behavior beyond `std::priority_queue`.
Core idea: store heap in an array and maintain heap property by swapping.
How it works:
- `insert`: append then bubble up (`heapifyUp`).
- `deleteTop`: swap root with last, remove last, bubble down (`heapifyDown`).
- `deleteValue`: replace target with last and re-heapify.

Dry-run:
- Insert: `5, 3, 8, 1` -> heap top is `1`.
- `deleteTop()` removes `1`, new top becomes `3`.
- `deleteValue(8)` removes `8`, heap property is restored.

Complexity:
- `insert`: `O(log n)`.
- `deleteTop`: `O(log n)`.
- `deleteValue`: `O(n)` to find + `O(log n)` to re-heapify.

Edge-case checklist:
- Operations on empty heap.
- Duplicate values with `deleteValue` (which instance to remove).
- Integer overflow in parent/child index arithmetic on huge arrays.

{% highlight c++ %}
#include <stdexcept>
#include <vector>

class MinHeap {
 private:
  std::vector<int> data_;

  void heapifyUp(int i) {
    while (i > 0) {
      int parent = (i - 1) / 2;
      if (data_[parent] <= data_[i]) {
        break;
      }
      std::swap(data_[parent], data_[i]);
      i = parent;
    }
  }

  void heapifyDown(int i) {
    int n = static_cast<int>(data_.size());
    while (true) {
      int left = 2 * i + 1;
      int right = 2 * i + 2;
      int smallest = i;

      if (left < n && data_[left] < data_[smallest]) {
        smallest = left;
      }
      if (right < n && data_[right] < data_[smallest]) {
        smallest = right;
      }
      if (smallest == i) {
        break;
      }

      std::swap(data_[i], data_[smallest]);
      i = smallest;
    }
  }

 public:
  void insert(int x) {
    data_.push_back(x);
    heapifyUp(static_cast<int>(data_.size()) - 1);
  }

  int top() const {
    if (data_.empty()) {
      throw std::runtime_error("heap is empty");
    }
    return data_[0];
  }

  void deleteTop() {
    if (data_.empty()) {
      return;
    }
    data_[0] = data_.back();
    data_.pop_back();
    if (!data_.empty()) {
      heapifyDown(0);
    }
  }

  bool deleteValue(int x) {
    int idx = -1;
    for (int i = 0; i < static_cast<int>(data_.size()); ++i) {
      if (data_[i] == x) {
        idx = i;
        break;
      }
    }
    if (idx == -1) {
      return false;
    }

    data_[idx] = data_.back();
    data_.pop_back();
    if (idx < static_cast<int>(data_.size())) {
      heapifyUp(idx);
      heapifyDown(idx);
    }
    return true;
  }

  bool empty() const { return data_.empty(); }
};
{% endhighlight %}
