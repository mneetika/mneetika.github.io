---
layout: single
comments: true
title: LRU Cache
date: 2026-03-20 10:00:00-0000
categories: C++
tags: [cpp, algorithms, cache, lru, hashmap, linked-list]
---

## Problem

Design an LRU cache with these operations:

- `get(key)`: return the value if present
- `put(key, value)`: insert or update the key

The cache has fixed capacity.
When it becomes full, remove the least recently used key.

Target:

- `get` in `O(1)`
- `put` in `O(1)`

## Idea

Use two data structures:

- `unordered_map<Key, Node*>` for fast lookup
- doubly linked list for recency order

Rules:

- `head` points to the most recently used node
- `tail` points to the least recently used node
- on `get`, move the node to the head
- on `put`, insert at head
- if full, remove the tail

## Why This Gives O(1)

- Hash map lookup is `O(1)` average.
- Doubly linked list removal is `O(1)`.
- Inserting at the head is `O(1)`.
- Tail eviction is `O(1)`.

That is why `hash map + doubly linked list` is the standard LRU interview pattern.

## Code

### 1. Node Structure

Each node stores:

- `key`
- `value`
- `prev`
- `next`

{% highlight c++ %}
template <typename Key, typename Value>
struct Node {
  Value value;
  Key key;
  Node* prev;
  Node* next;
};
{% endhighlight %}

### 2. Class Members

We need:

- `capacity_` for max size
- `size_` for current size
- `cache_map_` for `O(1)` lookup
- `head_` for most recently used
- `tail_` for least recently used

{% highlight c++ %}
#include <cstddef>
#include <optional>
#include <unordered_map>

template <typename Key, typename Value>
class LRUCache {
 public:
  using NodeType = Node<Key, Value>;

  explicit LRUCache(std::size_t capacity)
      : capacity_(capacity), size_(0), head_(nullptr), tail_(nullptr) {}

  LRUCache(const LRUCache&) = delete;
  LRUCache& operator=(const LRUCache&) = delete;

  ~LRUCache() {
    NodeType* curr = head_;
    while (curr) {
      NodeType* next = curr->next;
      delete curr;
      curr = next;
    }
  }

 private:
  std::size_t capacity_;
  std::size_t size_;
  std::unordered_map<Key, NodeType*> cache_map_;
  NodeType* head_;
  NodeType* tail_;
};
{% endhighlight %}

Why delete copy construction and copy assignment?

- this class owns raw pointers
- the default copy would be a shallow copy
- two cache objects would end up pointing to the same linked-list nodes
- both destructors would then try to delete the same memory

That causes double-free and undefined behavior.
Deleting copy operations is the safest choice unless we implement a full deep copy.

### 3. Remove a Node

This detaches a node from the doubly linked list.

{% highlight c++ %}
void remove(NodeType* node) {
  if (!node) {
    return;
  }

  if (node->prev) {
    node->prev->next = node->next;
  } else {
    head_ = node->next;
  }

  if (node->next) {
    node->next->prev = node->prev;
  } else {
    tail_ = node->prev;
  }

  node->prev = nullptr;
  node->next = nullptr;
}
{% endhighlight %}

### 4. Insert at Head

The head is always the most recently used node.

{% highlight c++ %}
void insertAtHead(NodeType* node) {
  if (!node) {
    return;
  }

  node->prev = nullptr;
  node->next = head_;

  if (head_) {
    head_->prev = node;
  } else {
    tail_ = node;
  }

  head_ = node;
}
{% endhighlight %}

### 5. Move a Node to Head

Whenever a key is used, it becomes most recently used.

{% highlight c++ %}
void moveToHead(NodeType* node) {
  remove(node);
  insertAtHead(node);
}
{% endhighlight %}

### 6. `get(key)`

Lookup in the hash map.
If found, move the node to head and return its value.
For a generic cache, `std::optional<Value>` is cleaner than a sentinel like `-1`.

{% highlight c++ %}
std::optional<Value> get(const Key& key) {
  auto it = cache_map_.find(key);
  if (it == cache_map_.end()) {
    return std::nullopt;
  }

  NodeType* node = it->second;
  moveToHead(node);
  return node->value;
}
{% endhighlight %}

### 7. `put(key, value)`

This handles:

- zero capacity
- existing key update
- eviction when full
- insertion of a new node

{% highlight c++ %}
void put(const Key& key, const Value& value) {
  if (capacity_ == 0) {
    return;
  }

  auto it = cache_map_.find(key);
  if (it != cache_map_.end()) {
    NodeType* node = it->second;
    node->value = value;
    moveToHead(node);
    return;
  }

  if (size_ == capacity_) {
    NodeType* victim = tail_;
    cache_map_.erase(victim->key);
    remove(victim);
    delete victim;
    --size_;
  }

  NodeType* node = new NodeType{value, key, nullptr, nullptr};
  insertAtHead(node);
  cache_map_[key] = node;
  ++size_;
}
{% endhighlight %}

### 8. Full Code

{% highlight c++ %}
#include <cstddef>
#include <optional>
#include <unordered_map>

template <typename Key, typename Value>
struct Node {
  Value value;
  Key key;
  Node* prev;
  Node* next;
};

template <typename Key, typename Value>
class LRUCache {
 public:
  using NodeType = Node<Key, Value>;

  explicit LRUCache(std::size_t capacity)
      : capacity_(capacity), size_(0), head_(nullptr), tail_(nullptr) {}

  LRUCache(const LRUCache&) = delete;
  LRUCache& operator=(const LRUCache&) = delete;

  ~LRUCache() {
    NodeType* curr = head_;
    while (curr) {
      NodeType* next = curr->next;
      delete curr;
      curr = next;
    }
  }

  std::optional<Value> get(const Key& key) {
    auto it = cache_map_.find(key);
    if (it == cache_map_.end()) {
      return std::nullopt;
    }

    NodeType* node = it->second;
    moveToHead(node);
    return node->value;
  }

  void put(const Key& key, const Value& value) {
    if (capacity_ == 0) {
      return;
    }

    auto it = cache_map_.find(key);
    if (it != cache_map_.end()) {
      NodeType* node = it->second;
      node->value = value;
      moveToHead(node);
      return;
    }

    if (size_ == capacity_) {
      NodeType* victim = tail_;
      cache_map_.erase(victim->key);
      remove(victim);
      delete victim;
      --size_;
    }

    NodeType* node = new NodeType{value, key, nullptr, nullptr};
    insertAtHead(node);
    cache_map_[key] = node;
    ++size_;
  }

 private:
  std::size_t capacity_;
  std::size_t size_;
  std::unordered_map<Key, NodeType*> cache_map_;
  NodeType* head_;
  NodeType* tail_;

  void moveToHead(NodeType* node) {
    remove(node);
    insertAtHead(node);
  }

  void remove(NodeType* node) {
    if (!node) {
      return;
    }

    if (node->prev) {
      node->prev->next = node->next;
    } else {
      head_ = node->next;
    }

    if (node->next) {
      node->next->prev = node->prev;
    } else {
      tail_ = node->prev;
    }

    node->prev = nullptr;
    node->next = nullptr;
  }

  void insertAtHead(NodeType* node) {
    if (!node) {
      return;
    }

    node->prev = nullptr;
    node->next = head_;

    if (head_) {
      head_->prev = node;
    } else {
      tail_ = node;
    }

    head_ = node;
  }
};
{% endhighlight %}

### 9. Example Usage

{% highlight c++ %}
LRUCache<int, int> cache(2);
cache.put(1, 10);
cache.put(2, 20);

auto value = cache.get(1);
if (value.has_value()) {
  // value.value() == 10
}

LRUCache<std::string, std::string> users(2);
users.put("alice", "active");
{% endhighlight %}

## Dry Run

Capacity = `2`

### Step 1

`put(1, 10)`

List: `[1]`

`head = 1`, `tail = 1`

### Step 2

`put(2, 20)`

List: `[2, 1]`

`head = 2`, `tail = 1`

### Step 3

`get(1)`

- key `1` exists
- move it to head
- return `10` wrapped in `std::optional`

List: `[1, 2]`

### Step 4

`put(3, 30)`

- cache is full
- evict key `2`
- insert key `3` at head

List: `[3, 1]`

### Step 5

`get(2)`

- not found
- return `std::nullopt`

## Complexity

- `get`: `O(1)` average
- `put`: `O(1)` average
- space: `O(capacity)`

## Common Bugs

- forgetting to return after updating an existing key
- deleting the wrong node during eviction
- not handling `capacity == 0`
- forgetting to move a node to head on `get`
- not removing the evicted key from the map
- breaking `head` and `tail` when only one node exists
- using a sentinel return value in a generic API
- allowing accidental copies when the class owns raw pointers

## Summary

Use a hash map for lookup and a doubly linked list for recency order.
`head` is MRU and `tail` is LRU.
