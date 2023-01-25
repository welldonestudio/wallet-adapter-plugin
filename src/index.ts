import {
  NetworkName,
} from "@aptos-labs/wallet-adapter-core";
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { Types } from "aptos";
import { WelldonePluginProvider } from "./injected-welldone";

interface WelldoneWindow extends Window {
  welldone_aptos?: WelldonePluginProvider;
}

declare const window: WelldoneWindow;

export const WelldoneWalletName = "WELLDONE_APTOS" as WalletName<"WELLDONE_APTOS">;

export class WelldoneWallet implements AdapterPlugin {
  readonly name = WelldoneWalletName;
  readonly url =
    "https://chrome.google.com/webstore/detail/welldone-wallet-for-multi/bmkakpenjmcpfhhjadflneinmhboecjf";
  readonly icon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAETCAYAAAAVqeK4AAAAAXNSR0IArs4c6QAAAJZlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgExAAIAAAARAAAAWodpAAQAAAABAAAAbAAAAAAAAAEsAAAAAQAAASwAAAABd3d3Lmlua3NjYXBlLm9yZwAAAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAROgAwAEAAAAAQAAARMAAAAAwzPlUAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAi9pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+d3d3Lmlua3NjYXBlLm9yZzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj4zMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjMwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Csg4CyYAABnZSURBVHgB7Z0JeB3Vdcfnad9t2fK+yPuKsQk2GAN2MAFDmmA2gwsuuFBwCWtDEpOWFAikhNAshaaBplBDPkKDIbTUJYRACDSBj6ZLQgEHApg1lLAZg2TZkq2eY/vZkv1GevNmu/fO737f0Zs3c5dzfnf01+jOnTueR4IABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACBhHI7fKl2yCfbHNlrTh8SkinfyvlJ4WsI63iH0rDbWIfib0q9ryYxvNfYk+KdYiRPK9MIMwWmy82WWyq2ASxRrE6sWYxW9MYcfz1Clu9x29jCOgvg5omFcTFO7Z2/lAhUUF5QOz7Yio2WUoDJNiTxJaKHS5ms2CI+8UlvTLBSmNwV3GI+8ylf8ld579NYnxU7AyxSjGXkwqqXrFuFnO9XzW+0WI7Lr30kwSBuAmUSQMLxW4Te0HsIjG9vHcl6ZDBCWJ6Jfaw2MliNWKZSdrBJAgkTWCsNPg3Yjq+olcqtqc5EsDPxX4odpDtwZTqP2JSKjnKRUFglFSiVyoPio0Tsy3Vi8M3iv2n2ALbnI/aX8QkaqLUVwqBo6TQr8WWl1I4pTLTpd0nxC4QK0/JB6OaRUyM6o5MO9Mk0d8ppn/pTf/lXCk+6q3vWWKkXQQQE04F0wjoX/p7xWpNc2yXPxfL560G+5caNsQkNfQ03AeBT8sxHUfReRqmJL1bo4PG3xLTbdJeBBCTvYDw1RgCh4kn94mZcnv1WvFFb2eTfAggJj5g2G0EAZ2X8gOxtGdqny8+rDaCiMFOICYGdw6u7SBwnPz8qxRZ/IG0fUOK7VvTNGJiTVdl2tHPSfQqKkknnQezRozfkyLIA6kISGRJnYAOeN4ipr/cSSX93bhDrCWpBm1vBzGxvQez47/+UuudlKTSudLQoqQac6EdxMSFXsxODPrw3DEJhDtI2rg6gXacagIxcao7MxHMNyXKuGfIfkXa4N+bgKcTYhIQGNlTJzBNPAi7sl1fQei4zFl9ZeBYYQKISWEu7DWbwOXiXlzn7qVSd5XZ4ZvpXVwdYma0eOUKgRkSSBxjJzp9/xxXICUdB2KSNHHai4rAmVFV1KOeZbLd0OM7mwEIICYBYJHVKAI6iS3qBwFPNypCy5xBTCzrMNzdTUAfAFy6+1v4DR141WeBSCUSQExKBEcxIwh8IkIvjpS6+H0IARR4IeBRNHUCKgBRJWa7hiSJmIQESPFUCYyU1vXFX1EkxCQkRcQkJECKp04ginVYdZX5CalHYrkDiInlHYj73pQIGGgdLMUYEiRiEhIgxVMnEIWYTE49CgccQEwc6MSMh6DjJmHTiLAVUJ5bYZwD9hNojCAEZr1GAJErkwggUkWqBKIQEx2AJYUkgJiEBEjx1AlEIQSmvvArdbhBHEBMgtAiLwQg4EsAMfFFwwEIQCAIAcQkCC3yQgACvgQQE180HIAABIIQQEyC0CIvBCDgSwAx8UXDAQhAIAgBxCQILfJCAAK+BBATXzQcgAAEghBATILQIi8EIOBLADHxRcMBCEAgCAHEJAgt8kIAAr4EEBNfNByAAASCEEBMgtAiLwQg4EsAMfFFwwEIQCAIAcQkCC3yQgACvgQQE180HIAABIIQQEyC0CIvBCDgSwAx8UXDAQhAIAgBxCQILfJCAAK+BBATXzQcgAAEghBATILQIi8EIOBLADHxRcMBCEAgCAHEJAitwnk/KrybvRDIFgHEJHx/d4evghpCEIB/CHhRFkVMoqRJXRDIMAHEJMOdT+gQiJIAYhIlTeqCQIYJICYZ7nxCh0CUBBCTKGlSFwQyTAAxyXDnEzoEoiSAmERJk7ogkGECiEmGO5/QIRAlAcQkSprUBYEME0BMMtz5hA6BKAkgJlHSpC4IZJgAYpLhzid0CERJADGJkiZ1pUGAB/3SoF6gTcSkABR2QQACwQkgJsGZUQICEChAADEpAIVdEIBAcAKISXBmlIAABAoQQEwKQGEXBCAQnABiEpwZJSAAgQIEEJMCUNgFAQgEJ4CYBGdGCQhAoAABxKQAFHZBAALBCSAmwZlRAgIQKEAAMSkAhV0QgEBwAohJcGaUgAAEChBATApAYRcEIBCcAGISnBklzCLAU8OG9AdiYkhH4AYEbCeAmNjeg/gPAUMIICaGdARuQMB2AoiJ7T2I/xAwhABiYkhH4AYEbCeAmNjeg/gPAUMIICaGdARuBCdQXlnrjd7/lIbgJSkRB4GKOCqlTgjESaB+8CSv9WNneq0HrvS6u7cPff2pu+JsjrqLJICYFAmKbCkTyOW8YZOP9iYtuNhrGb/I8+S7pi1tb6fsGM3nCSAmeRJ8GkmgrLzKGzVrmTf5sM96jUOnG+kjTu0kgJhwJhhJoLyyzhs372xv0qF/5tU0DjfSR5zqTQAx6c2DbykTKKuo9sbOOd2besRfiIiMSNkbmg9CADEJQou8sREoK6/0Wuee5U1ddJlX3TAstnaoOD4CiEl8bKm5SAJDJi72Zh17PWMiRfIyNRtiYmrPZMCv5tFzvf2O+Zo3aOz8DETrfoiIift9bFyEVbXNO8ZExh+0ysuVlRvnHw6VRgAxKY0bpUogoMIxbu7Z3rQjr/BUUEhuEUBM3OpPY6PROSIHHH+T1zx6nrE+4lg4AohJOH6U7oeA3qWZuOAib9oRl3t625fkLgHExN2+TT2yASNmex878R+8pmEzU/cFB+IngJjEzzh7LchzMxPmf8abedQ1XI1kqPcRkwx1dhKh1g4YI1cj35WH8RYm0RxtGEQAMTGoM2x3ZcT047wDTrjZq6wZYHso+F8CAcSkBGgU6U0gV1Yh0+BXe1M//ue7lwbonYNvWSCAmGShl2OMsaZppDfvlO/JLNZDYmyFqm0ggJjY0EuG+qjT4A9aficP5hnaP0m7hZgkTdyR9kbvv1wmof2d3K2pcSQiwghLADEJSzBj5XV8ZL9jvrrj1m/GQifcfgggJv0A4vAeAuVV9d7cZbd7w6ceu2cnWxDYRQAx4VQoikBV3SDv4NPuZrmAomhlMxNiks1+DxR1ffN4b/4Z/+w1DJ4cqByZs0UAMclWfweOtmnYft6CM9fJHZuhgctSIFsEEJNs9XegaAeOPMA75Iz7vKq6wYHKkTmbBBCTbPZ7v1EPbj3Um7/iHq+iuqnfvGSAgBJATDgP9iGgD+nNX/FDT99dQ4JAsQR4cXmxpDKSb9CYg+WuzVqEJCP9HWWYiEmUNC2vSxczmr/iXvnXptHySHA/DQKISRrUDWxzx12blfd7lbUDDfQOl2wggJjY0Esx+1g7YLQ3/4/uZcX4mDm7Xj1i4noP9xOfzmxdcOa/erVNo/rJyWEI9E0AMembj9NH9W6NTpFvaJnqdJwElwwBxCQZzsa1ksuVyUN7a3jWxriesdchxMTevgvl+fRPXOUNn/apUHVQGAI9CSAmPWlkZHvM7NO8yYdfmpFoCTMpAohJUqQNaUcnpc1Z+m1DvMENlwggJi71Zj+xVNcP8eadegcvxuqHE4dLI4CYlMbNulK5snLvwJNv9XQ1eRIE4iCAmMRB1cA6px95pTdk4pEGeoZLrhBATFzpyT7i0DVbJx/22T5ycAgC4QkgJuEZGl2DjpPMWfod3rRndC9Z71ynRoCYWN+PfQSQy3lzjr+JJRf7QMShSAggJpFgNLiSCQefx2spDO4fh1xDTBzqzH1C0edtZh59zT772QGBGAggJjFANaJKfe5GJ6bx6k4juiMLTiAmrvbyxAUXeoNbF7gaHnGZRaBN3NmmLjEAa1bHhPZGX5Q1bfFfhq6HCiBQJIFN+XyISZ6EC59y92b2cTfKYtC1LkRDDHYQ+CDvJmKSJ+HA5+hZp3r6mgoSBBIkwJVJgrATaUpfljVzyVcSaYtGINCDwHv5ba5M8iQs/5y++EteTeMIy6PAfQsJvJn3GTHJk7D4s3HodG/8wassjgDXLSbwf3nfEZM8CYs/Zy651suV8aZXi7vQZtcRE5t7r6fvLeMXecMmH91zF9sQSJLAW/nGuDLJk7DwU2e67nfMtRZ6jssOEXglHwtikidh4efo/Zd7A0bMsdBzXHaIwEv5WBCTPAnLPnUZximLvmCZ17jrGAGdSv/7fEx5MXk/v4NPOwiMmX26vIlvih3O4qWrBHZflWiAeTE5VbZ3PKzjatQuxVVWXulN+fhql0IiFjsJvNjT7byY/ER2frHnAbbNJTBaXqJV3zzeXAfxLCsEnukZaF5MdN/1Ymt0g2QwAXmYb9KhFxvsIK5liMDTPWPtKSa6/zyxX/bMwLZZBEZM+7TXOGSaWU7hTVYJ9CkmHULlJLHdI7RZpWRq3JMOvcRU1/ArWwR0dbXne4a895WJHntN7ASxrfqFZA4BXT1t0Nj55jiEJ1km8KwE30sjComJAnpcjD+BSsKgNGH+ZwzyBlcyTuDJveP3ExPNJ29u8m7euwDf0yFQ0zjcGy7jJSQIGEJgn7HVvsREfb5Q7FFDnM+0G61zz/Z0fgkJAoYQCCwmOsiiE9p0HIWUEgFdXqD1wJUptU6zENiHQLvs6TXHRHP0d2WiefQR46ViWgEpBQLDpizxaptGpdAyTUKgIIFfyN6uvY8UIyZa5n/Ezt27MN+TITB2zopkGqIVCBRHoODQR7Fiok3cIfaN4toiV1QEqmqbvWFTjomqOuqBQBQEflaokiBiouX1mfcfFaqIffEQGLX/qfKaz+p4KqdWCAQnoMMd+wy+ajVBxUSfLD5d7AUtTIqfwBh5qI8EAYMIPCa+9JqslvctqJhoOV37RCc87H75ju4kRU+gbmCr1zzqwOgrpkYIlE7A9z+TUsRE3fiN2Bli2/ULKR4CI2fKUw3ylDAJAgYRuN/Pl1LFROv7F7Gr/Spmf3gCI2ccH74SaoBAdAR0ZTXfIY4wYqIuXiW2VjdI0RLQeSXNo+dFWym1QSAcgXV9FQ8rJt1S+VlivdY16KtBjhVHYPi0T/IvTnGoyJUcgbv7aiqsmGjdH4kdJ/aOfiFFQ2DoZOaWREOSWiIioG/u09UEfFMUYqKVbxD7Q7F9ptjqQVIwAjqvpGX84cEKkRsC8RK4R6rvc9H5qMREw3hIjEWplUTI1DJ+oVdR1RCyFopDIFIC/Y6NRikm6vlfi/1jpCFksLKhk47KYNSEbDCBN8S3n/fnX9Riou3pcmAFp9v25wzHdxLQKxMSBAwi8D3xpc9/cdTXOMREF6XWCRK/0wZIwQjog31Nw/YLVojcEIiXwO3FVB+HmGi7KiTLxArO4dcMpMIEBrUeKpNe4+qWwm2yFwJ9ENC1Xtf3cXz3oTjPWr2N9Ke7W2KjKAIt47iLUxQoMiVFoOgx0DjFRINVR1iUOkC38yqLALDIGjeBD6WBO4ttJG4xUT9YlLrI3tAFowcMn1VkbrLtItANidgIrJGai14dIAkxYVHqIvu6SYSkrKKmyNxkg0DsBP4+SAtJiIn6o4tS65R7FqVWGj6pedRcnyPshkDiBB6RFgM9c5eUmCiJX4mdqxukwgQGjjyg8AH2QiB5Al8P2mSSYqK+6aLUgZ0MGpSt+RuHzrTVdfx2i4DeCvZdUc0v1KTFRP3QRal9V2vyc9T5/bKiWuOQqc6HSYBWELhOvAy8imIaYqJOrhDzXbHJCtwRO6nrvVZUN0ZcK9VBIDABfQ6n6NvBPWtPQ0y0/fyi1B/0dCbL201DZ2Q5fGI3h8DXxJWSZq6nJSaKThelPlMs8OWUFnYtNbRMcS0k4rGPwJvi8ndLdTtNMVGfdVHqL5fqvEvl6prHuRQOsdhJ4Bpxe3OprqctJuq3ikm/C6+UGqAt5eqbx9viKn66SeBVCeuWMKGZICY6HfossUATZMIEbWLZukHjTHQLn7JDQN80sSVMuCaIifqvi1KfIPaefrEshX5Lli45UDdgrGVh465DBJ6SWG4LG48pYqJx6K3iU8W69ItFKfRirdUNQ8t5OblFPe6eq5+XkPpdSa2/sE0SE/X1IbHL+nPateM1jSPLXYuJeKwh8IB4+mAU3pomJhqTTre/NYrgbKmjpmlkhS2+4qdTBPS/AL0qiSSZKCYa2Pli/xFJhBZUUtM4nCsTC/rJQRdvkJgiu/FhqphkalHqqrrBiImDv6mGh6Rv6PtylD6aKiYao87G00WpQ92u0opMT5U1TSb3g+n48K80ApdIsUgfZzH9JM7EotSV1QNM74fSTldKmUpAB1x/ELVzNpzEayTom6IO3KT6KmoabegHk5DhS+kE2qToeaUX9y9py0l8kYTwqH8Ydh+prOLfHLt70CrvdT2hl+Lw2BYx0UWpTxLbEAeEtOvMVdbY0g9po6L9cAT0D/J3wlXhX9qmk/hdCeNEMecWpS4rY5qJ/ynKkYgI6DtwzhbTZ+FiSTaJiQLQRanPiYVEipXmyitDP9+Tovs0bQeBC8TNF+N01TYxURbfF7s+TihJ112WK0dMkoaerfbulnBvjztkG8VEmejzO84sSp3j35y4z/Ms1/+6BL8qCQC2ioku9bhC7LdJQIq/DS5M4mecyRZ0LddTxBJZ2sNWMdEzQxel1rcERjqLTysmQcARAp+TOJ5IKhabxUQZ/UaMRamTOltoxyYCOsP1xiQdtl1MlJUuSn1VktBoCwKGE3hW/PuTpH10QUyU2dVidyUNj/YgYCABHR85XkyXQk00uSImOhFHJ+T8b6L0aAwCZhHQmeL6pH0qNyZcERPtUlViHZB9R7+QIJBBAhdKzD9NK26XxEQZviy2XMy2RanFZRIEQhHQ5U5vDlVDyMKuiYnieFhsdUguFIeATQT+SZz9QtoOuygmyvQbYplalDrtE4n2UyPwiLS8UkwncqaaXBUThZqpRalTPYtoPC0C/y0NLxUzYmlTl8WkQyDrLbLfiZEg4BoBnbD5STFdWsCI5LKYKGBdlPpkMSOUWx0iQSACAs9LHYvF3oqgrsiqcF1MFJQ+m7AqMmJUBIF0CbwgzR8hpn8ojUpZEBMFfptYbMvVGdWjOOMygfwViZH/umdFTPQEu1jsZ7pBgoCFBNaLz3pF8pqpvmdJTHSqsY6fbDC1M/ALAj4E9K7NQjEjr0jyPmdJTDRmZxelzncon84R+HeJaLGY8Y+JZE1M9EzTRanPENOHA0kQMJnAveLcEjErFgDLopjoyXOPmFOLUmtQJKcI3CDR6L/lm22JKqtiov3zRbF/s6Wj8DMzBLZJpJeK6Q2D1KfIB6GeZTHRjjpNTEfJSRAwgYDOZj1JTJ8tsy5lWUy0szaJnSBmxf+k6jDJWQL6gqxDxHQZUitT1sVEO+05MR2QteqSUh0nOUPgQYnkILFnbI4IMdnZe/fJx5U2dyS+W0lA7yheJ6YP7L1nZQQ9nEZM9sC4RjZZlHoPD7biJfC2VH+s2GViOuhqfUJM9nSh/pVgUeo9PNiKj8BDUvUcsR/H10TyNSMmvZmzKHVvHnyLlsAWqU6vRHQimtFT40sJu6KUQo6XeVniWy72gJizfLZv6/S6Oj7Y3tX5UVfXlrbO7V3tHds6N2/u6upol7nBOy+7t3d1bd/W1SYcvFxZWX2uvGoXj+7yisraurKKmtryyrqaiqq6yvLKhorKmgFlZRXVmp20LwEdXNX3Y+sMbCeTs78sIXvrYSmvC/Raeb9fY+/c/EF3x4dvtHe0vf12Z/t7r3Zu/ejF7Z3tr3R3dTzbtX3L+vU/vuIZLzcg6kcKcjOOWD3Dq6ibUV5VP728om5cRVXDhMq6Qa019UNaappG1VfVDcqpfxlK+qYEXTn+CjG9MnE2ISb+XftNOTRTTMdRjE3btrZ3t72/oW3zpjde27r53V93bd70mAjHQ+t/8qW+X8SUuzKOmLqffeQ6/Qvse4tz0oILJ1Y1Djuqunbwwqr6IbNrGkeOaRg8saGiutFFkdGrED1/9Klf5xNi0ncXXyCHZ4npHID0U3e3177x5S1t7730SseHbz6+te2Du6c3tT6wbu0p1twNeOHxG18UkGo37Qa6bFn59HdmLqlqaDm5pmnkAhGXcfWDJ1bnctYO6enY25Vi3xKzpm/E11AJMekbX4ccPl7sl2Kj+s4az9HNG1/Zuun3zz3Xsen1dV2d79/y9I++pL+Iu9PTu7cs3li7dtt6b+39EoHajjR14QXjK+tbz64bOPZTjUOnT2sYPMmWwZh1EsD5Yq/ujCQ7PxGT/vv6TcmyTOwRsdhP6G2d7d7GN3/1Rvu7Gx7s2rLx5qfu//yT/bvoXo7nHvvbDRLV5bvMm7Lo0nm1TeNW1Q+asKR59NxRBv5b9Kz4eqHYT8UymRCT4rr9Ccm2SmxNcdmD5drW2bbl3Vd+8Vb7xlfXbe388Oqn77vEqFXHg0UTT+7nH/26Xh2qecP2P7q+ZcTCcxpapq1sGDRhfDwtFl2rLlp0jdi3xXSwlQSBogjoCaN3QHoas2aLQmd0Jh1s79mnxWzruMhXxZqMjgznjCVQKZ7pZWzPkw0xMba7inYsiJi0S606ZWBY0bWTEQI+BAbLfh0EzQsKYuIDyqLdxYiJDsbfLDbSorgSddXae2+JUurd2Lvy9USxtt67+eYogY0Slz7ZO05Mx82cmwYvMZFSJqArYukaKFyZpNwRETRf6Mpkg9S7WmxgBPVTBQT6JaADcIhJv5iMz5AXE/3joGNiOhWAO53Gd5tbDpZLOH/sVkiZjOYKiVpnq07LZPQEDQEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAgQQJ/D/LxtSxjmI1fwAAAABJRU5ErkJggg==";

  provider: WelldonePluginProvider | undefined =
    typeof window !== "undefined" && window.dapp ? window.welldone_aptos : undefined;

  constructor () {
    if (typeof window != 'undefined' && window.dapp) {
      window.welldone_aptos = new WelldonePluginProvider();
    }
  }

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) throw `${WelldoneWalletName} Address Info Error`;
      return accountInfo;
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.account();
    if (!response) throw `${WelldoneWalletName} Account Error`;
    return response;
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );
      // if ((response as AptosWalletErrorResult).code) {
      //   throw new Error((response as AptosWalletErrorResult).message);
      // }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  // TODO: signTransaction
  // async signTransaction(
  //     transaction: Types.TransactionPayload,
  //     options?: any
  //   ): Promise<Uint8Array | null> {
  //     try {
  //       const response = await this.provider?.signTransaction(
  //         transaction,
  //         options
  //       );
  //       if ((response as AptosWalletErrorResult).code) {
  //         throw new Error((response as AptosWalletErrorResult).message);
  //       }
  //       return response;
  //     } catch (error: any) {
  //       const errMsg = error.message;
  //       throw errMsg;
  //     }
  //   }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${WelldoneWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw `${WelldoneWalletName} Sign Message failed`;
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network();
      if (!response) throw `${WelldoneWalletName} Network Error`;
      return {
        name: response as NetworkName,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      const handleNetworkChange = async (newNetwork: {
        networkName: NetworkInfo;
      }): Promise<void> => {
        callback({
          name: newNetwork.networkName.name,
          chainId: undefined,
          api: undefined,
        });
      };
      await this.provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      const handleAccountChange = async (
        newAccount: AccountInfo
      ): Promise<void> => {
        if (newAccount?.publicKey) {
          callback({
            publicKey: newAccount.publicKey,
            address: newAccount.address,
          });
        } else {
          const response = await this.connect();
          callback({
            address: response?.address,
            publicKey: response?.publicKey,
          });
        }
      };
      await this.provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }
}
