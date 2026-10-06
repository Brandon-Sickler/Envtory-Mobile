/**
 * Utility class for calculating lumber surface measure according to standard NHLA grading rules
 * 
 * Architecture note: this logic lives on the mobile client rather than the Spring Boot backend to support 
 * offline first grading. By keeping the alternating rounding state locked to the local
 * device during a grading sessions, we prevent singleton state-bleed across different users on the server
 */

export class NHLACalculator {

    /**
     *tracks the alternating rounding state for exact-half decimal values.
     NHLA rules require that boards landing on exacatly a .5 boundary alternate between rounding up and rounding down
     */

    private roundUpNextHalf: boolean = true;

/**
 * Calculates the surface measure of a board based on its width and length.
 * 
 * @param widthInches - The width of the board in inches
 * @param lengthFeet - The lenght of the board in feet
 * @returns - The finalized rounded surface measure
 */

    calculateSurfaceMeasure(widthInches: number, lengthFeet: number) : number {
       //First calculate the raw unrounded surface measure
        const rawMeasure = (widthInches * lengthFeet) / 12;
       //Second- isolate the decimate portion using modulo
        const fractionalPart = rawMeasure % 1;

        //check for the exact half using microscopic difference
        if (Math.abs(fractionalPart - 0.5) < 0.0001) {
           //apply the current alternating rule
            const result = this.roundUpNextHalf ? Math.ceil(rawMeasure) : Math.floor(rawMeasure);

            //Flip the toggle so the next exact half board does the opposite
            this.roundUpNextHalf = !this.roundUpNextHalf;

            return result;
        }

        //For all other values, use standard math rounding
        return Math.round(rawMeasure);
    }


}