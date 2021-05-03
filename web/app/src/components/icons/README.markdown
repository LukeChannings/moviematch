Icons are from [Iconic](https://iconic.app). They have an `@iconicicons/react` package, but it has serious issues with colours and sizing.
My process is to copy the SVG into a new React component and use the `iconProps` function from `Icon.ts` to standardise Icon attributes.

### RatingSymbols

The RIAA certificates don't really work well as icons, so I just display the text, e.g. `TV-MA`.
BBFC icons are from [Wikipedia](https://en.wikipedia.org/wiki/British_Board_of_Film_Classification#Current_certificates).