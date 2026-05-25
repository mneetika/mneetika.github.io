---
layout: single
comments: true
title: Segment Tree and Fenwick Tree
date: 2026-03-04 10:00:00-0000
categories: C++
tags: [cpp, algorithms, segment-tree, fenwick-tree]
---

## Fenwick Tree (Binary Indexed Tree)
Fenwick tree supports point updates and prefix/range sums efficiently.
Core idea: each index stores partial sum of a power-of-two range.
How it works: move index with `idx += idx & -idx` for update and reverse for query.

Dry-run:
- Array starts `[0,0,0,0,0]`.
- `add(2, 5)`, `add(4, 3)`.
- `prefixSum(4) = 8`, `rangeSum(2,4) = 8`.

Complexity:
- `add`: `O(log n)`.
- `prefixSum`: `O(log n)`.
- `rangeSum`: `O(log n)`.
- Space: `O(n)`.

Edge-case checklist:
- 0-index vs 1-index conversion mistakes.
- Query ranges with `l > r`.

{% highlight c++ %}
#include <vector>

class Fenwick {
 public:
  explicit Fenwick(int n) : bit_(n + 1, 0) {}

  void add(int idx, int delta) {
    for (++idx; idx < static_cast<int>(bit_.size()); idx += idx & -idx) {
      bit_[idx] += delta;
    }
  }

  int prefixSum(int idx) const {
    int sum = 0;
    for (++idx; idx > 0; idx -= idx & -idx) {
      sum += bit_[idx];
    }
    return sum;
  }

  int rangeSum(int l, int r) const {
    if (l > r) {
      return 0;
    }
    return prefixSum(r) - (l == 0 ? 0 : prefixSum(l - 1));
  }

 private:
  std::vector<int> bit_;
};
{% endhighlight %}

## Segment Tree (Point Update, Range Sum Query)
Segment tree is a binary tree over array ranges.
Core idea: each node stores combined value of its interval.
How it works:
- Build recursively from leaves.
- Query visits only overlapping segments.
- Update touches one root-to-leaf path.

Dry-run:
- `nums = [2,1,5,3]`.
- Query `[1,3]` returns `1+5+3 = 9`.
- Update index `2` to `4`.
- Query `[1,3]` now returns `1+4+3 = 8`.

Complexity:
- Build: `O(n)`.
- Point update: `O(log n)`.
- Range query: `O(log n)`.
- Space: `O(n)` (commonly allocated as `4n`).

Edge-case checklist:
- Empty array construction.
- Index bounds and inclusive range handling.

{% highlight c++ %}
#include <vector>

class SegmentTree {
 public:
  explicit SegmentTree(const std::vector<int>& nums)
      : n_(static_cast<int>(nums.size())), tree_(4 * nums.size(), 0) {
    build(1, 0, n_ - 1, nums);
  }

  void update(int idx, int value) { update(1, 0, n_ - 1, idx, value); }

  int query(int ql, int qr) const { return query(1, 0, n_ - 1, ql, qr); }

 private:
  int n_;
  std::vector<int> tree_;

  void build(int node, int left, int right, const std::vector<int>& nums) {
    if (left == right) {
      tree_[node] = nums[left];
      return;
    }
    int mid = left + (right - left) / 2;
    build(node * 2, left, mid, nums);
    build(node * 2 + 1, mid + 1, right, nums);
    tree_[node] = tree_[node * 2] + tree_[node * 2 + 1];
  }

  void update(int node, int left, int right, int idx, int value) {
    if (left == right) {
      tree_[node] = value;
      return;
    }
    int mid = left + (right - left) / 2;
    if (idx <= mid) {
      update(node * 2, left, mid, idx, value);
    } else {
      update(node * 2 + 1, mid + 1, right, idx, value);
    }
    tree_[node] = tree_[node * 2] + tree_[node * 2 + 1];
  }

  int query(int node, int left, int right, int ql, int qr) const {
    if (qr < left || right < ql) {
      return 0;
    }
    if (ql <= left && right <= qr) {
      return tree_[node];
    }
    int mid = left + (right - left) / 2;
    int left_sum = query(node * 2, left, mid, ql, qr);
    int right_sum = query(node * 2 + 1, mid + 1, right, ql, qr);
    return left_sum + right_sum;
  }
};
{% endhighlight %}

## Segment Tree with Lazy Propagation (Range Add, Range Sum)
Lazy propagation makes range updates efficient.
Core idea: postpone updates and store them in `lazy` until needed.
How it works: `push` applies pending value to current node and propagates to children.

Dry-run:
- Start with all zeros, size `5`.
- `rangeAdd(1,3,2)` means indices `1..3` become `+2`.
- `rangeQuery(0,4)` returns `6`.
- `rangeAdd(2,4,1)` then `rangeQuery(2,3)` returns `6` (`3+3`).

Complexity:
- Range update: `O(log n)`.
- Range query: `O(log n)`.
- Space: `O(n)` for tree + lazy arrays.

Edge-case checklist:
- Forgetting to `push` before descending causes stale values.
- Overlapping updates with incorrect propagation order.

{% highlight c++ %}
#include <vector>

class LazySegmentTree {
 public:
  explicit LazySegmentTree(int n) : n_(n), tree_(4 * n, 0), lazy_(4 * n, 0) {}

  void rangeAdd(int ql, int qr, int delta) { rangeAdd(1, 0, n_ - 1, ql, qr, delta); }

  int rangeQuery(int ql, int qr) { return rangeQuery(1, 0, n_ - 1, ql, qr); }

 private:
  int n_;
  std::vector<int> tree_;
  std::vector<int> lazy_;

  void push(int node, int left, int right) {
    if (lazy_[node] == 0) {
      return;
    }
    tree_[node] += (right - left + 1) * lazy_[node];
    if (left != right) {
      lazy_[node * 2] += lazy_[node];
      lazy_[node * 2 + 1] += lazy_[node];
    }
    lazy_[node] = 0;
  }

  void rangeAdd(int node, int left, int right, int ql, int qr, int delta) {
    push(node, left, right);
    if (qr < left || right < ql) {
      return;
    }
    if (ql <= left && right <= qr) {
      lazy_[node] += delta;
      push(node, left, right);
      return;
    }

    int mid = left + (right - left) / 2;
    rangeAdd(node * 2, left, mid, ql, qr, delta);
    rangeAdd(node * 2 + 1, mid + 1, right, ql, qr, delta);
    tree_[node] = tree_[node * 2] + tree_[node * 2 + 1];
  }

  int rangeQuery(int node, int left, int right, int ql, int qr) {
    push(node, left, right);
    if (qr < left || right < ql) {
      return 0;
    }
    if (ql <= left && right <= qr) {
      return tree_[node];
    }

    int mid = left + (right - left) / 2;
    int left_sum = rangeQuery(node * 2, left, mid, ql, qr);
    int right_sum = rangeQuery(node * 2 + 1, mid + 1, right, ql, qr);
    return left_sum + right_sum;
  }
};
{% endhighlight %}
