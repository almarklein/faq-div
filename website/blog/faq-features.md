# The features of an effectice FAQ

<!-- DATE: 2020-09-21 -->

This post is part of a small series on writing effective FAQ pages:

* [Understanding the different purposes of a FAQ](faq-purposes.html)
* Selecting (technical) features for your FAQ (this post)
* [Writing content for your FAQ](faq-write.html)

----

In this post I focus on the technical side of creating a good FAQ. A FAQ can fulfill multiple [purposes](faq-purposes.html), and these purposes can be strengthened by different (technical) features.

## The user with a question

To serve the users who search for information in your FAQ, you will want to make sure that … you guessed it … searching the FAQ is easy. If your FAQ is small, having collapsed answers may be enough to allow users to scan for the question that matches theirs.

An even better feature is a search field. Naturally, search should be case insensitive and multiple words / partial sentences should be handled well.

## The casual user

To serve your casual visitors who just want to learn more, you want to provide a gentle way to show what information is available, but only show details when the user needs it. Having collapsable answers is an effective method to achieve this.

Dividing the FAQ into multiple sections can help maintain structure in larger FAQ pages. Don't forget to style the FAQ so that it looks great!

## The potential visitor

To make sure that users find your website via a search engine, you’ll have to create the right content, but that’s a topic for a [next post](faq-write.html). What’s important technically, is that the search engines are able to crawl the content of your FAQ. In other words, the FAQ must be static HTML.

Beware of solutions that host your FAQ on another domain. You want to make sure that the FAQ feels integrated with your own website. And you may want to consider the privacy of your website's visitors.

## How to implement

You will have to decide which of the potential purposes are important for your website, and subsequently what features make sense.

[FAQ-div](/) is a small JavaScript library that makes it very easy to implement all the above features (and more). It is highly configurable, so you can make it as simple/advanced as you like. Surely there are other solutions out there, but hey, this is my blog, so I’m promoting my tools. All of  the above still applies.
