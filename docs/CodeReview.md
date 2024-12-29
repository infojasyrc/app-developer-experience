# Code Review

According to the Book: Implementing Effective Code Reviews by Giuliana Carullo 2020

## Fundamental Principles of good code

### Zend of Python

Beautiful is better than ugly.

Explicit is better than implicit.

Simple is better than complex.

Complex is better than complicated.

Flat is better than nested.

Sparse is better than dense.

Readability counts.

Special cases aren’t special enough to break the rules.

Although practicality beats purity.

Errors should never pass silently.

Unless explicitly silenced.

In the face of ambiguity, refuse the temptation to guess.

There should be one-- and preferably only one --obvious way to do it.

Although that way may not be obvious at first unless you’re Dutch.

Now is better than never.

Although never is often better than right now.

If the implementation is hard to explain, it’s a bad idea.

If the implementation is easy to explain, it may be a good idea.

Namespaces are one honking great idea -- let’s do more of those!

## Principles

- KISS principle
- Reusability
- Readability
- Modularity
- Maintainability
- Testability
- Composition vs Inheritance
- Premature Optimization

## Checklist

The following are potential structure issues that should be checked during code review:

### Code Structure

1. Does the actual implementation reflect the architecture?
2. Is the code easy to understand?
3. Is the code too long?
4. Is cohesion in place?
5. Is the code modular?
6. Are components cohesive?
7. Is the code loosely coupled?
8. Is the code reusable?
9. Is the code readable?
10. Is the code easy to maintain and test?
11. Are premature optimizations in place?
12. Is composition preferred?
13. Is inheritance properly used?
14. Is the flow easy to understand?
15. Are interactions between different components easy to catch?
16. Are conditional flows completely defined?
17. Is there any undefined behavior?
18. Are APIs consistent and as clean as the overall code?

### Data Structure

1. Are data structures appropriately used?
2. Is the data structure appropriate based on the data size the code is dealing with?
3. Are potential changes to data size considered and handled?
4. Is the data structured forced to do operations not natively supported?
5. Does the data structure support growth (i.e., scalability)?
6. Does the data structure reflect the need for relationships between elements?
7. Does the data structure optimally support the operations you need to perform on it?
8. Is the choice of a specific data structure overcomplicating the code?
9. Is the data structure chosen based on most frequent operations to be performed on data?
10. Are you using stacks for problems that do not require FIFO?
11. Are you using queues for problems that do not require LIFO?
12. Does the data structure reflect any ordering on sorting requirements?
13. From a logical perspective, is the code meant to update the key within a hash map? If so, rethink the problem and see if hash maps are the best data structure to deal with it.
