#!/bin/bash
export scale=10;
export line_rate=$(cat coverage/cobertura-coverage.xml | xmlstarlet fo -D | xmlstarlet sel -t -m "coverage" -v "@line-rate")
export target=0.8
export passing_p=$(echo $line_rate '>=' '0.8' | bc)
exec test $passing_p -eq 1
