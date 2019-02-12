# Test Cases for Project One

Sample tests from Project One .pdf:
1.
`
{}$	
{{{{{{}}}}}}$	
{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$	
{	/*	comments	are	still	ignored	*/	int	@}$`	

2.
`
{	
			int	a	
			a	=	a	
			string	b	
			a	=	b	
}$`

My tests:

1.
Comments within strings
`
"string/*  comments are not ignored here    *//* these will count as CHAR's*/"$
"/* comments are not ignored */"$

2.
Strings and comments within comments
`
/*  "This string is ignored" */"This one is
not"$
/*  /* This comment should still be ignored  */$